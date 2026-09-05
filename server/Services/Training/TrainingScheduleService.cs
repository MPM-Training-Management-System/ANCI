using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Training.Schedule;
using server.Enums;
using server.Models.Training;
using server.Services.Interfaces;

namespace server.Services.Training;

public class TrainingScheduleService : ITrainingScheduleService
{
    private readonly ApplicationDbContext _context;

    public TrainingScheduleService(ApplicationDbContext context)
    {
        _context = context;
    }

    // ============================================================
    // GET SCHEDULE RECOMMENDATION
    // ============================================================

    public async Task<TrainingScheduleRecommendationDto>
        GetRecommendationAsync(Guid trainingBatchId)
    {
        var batch = await _context.TrainingBatches
            .Include(x => x.TrainingProgram)
            .FirstOrDefaultAsync(x => x.Id == trainingBatchId);

        if (batch == null)
        {
            throw new KeyNotFoundException(
                "Training batch not found."
            );
        }

        ValidateBatch(batch);

        // Duration comes from TrainingProgram
        var requiredHours =
            (decimal)batch.TrainingProgram.DurationHours;

        var startDate =
            DateOnly.FromDateTime(batch.StartDate);

        var endDate =
            DateOnly.FromDateTime(batch.EndDate);

        var availableDays =
            GetAvailableTrainingDays(
                startDate,
                endDate,
                batch.IncludeWeekends
            );

        if (availableDays.Count == 0)
        {
            throw new InvalidOperationException(
                "No available training days within the selected period."
            );
        }

        var availableWeeks =
            CalculateAvailableWeeks(
                startDate,
                endDate
            );

        var recommendation =
            CalculateRecommendation(
                requiredHours,
                availableDays.Count,
                availableWeeks
            );

        return new TrainingScheduleRecommendationDto
        {
            TrainingBatchId = batch.Id,

            RequiredHours = requiredHours,

            StartDate = startDate,

            EndDate = endDate,

            AvailableWeeks = availableWeeks,

            RecommendedSessionsPerWeek =
                recommendation.SessionsPerWeek,

            RecommendedHoursPerSession =
                recommendation.HoursPerSession,

            EstimatedWeeklyHours =
                recommendation.WeeklyHours,

            EstimatedSessionCount =
                recommendation.SessionCount,

            IncludeWeekends =
                batch.IncludeWeekends
        };
    }

    // ============================================================
    // GENERATE TRAINING SCHEDULE
    // ============================================================

    public async Task<IReadOnlyList<TrainingSessionDto>>
        GenerateScheduleAsync(
            Guid trainingBatchId,
            GenerateTrainingScheduleRequest request)
    {
        var batch = await _context.TrainingBatches
            .Include(x => x.TrainingProgram)
            .Include(x => x.TrainingSessions)
            .FirstOrDefaultAsync(x => x.Id == trainingBatchId);

        if (batch == null)
        {
            throw new KeyNotFoundException(
                "Training batch not found."
            );
        }

        ValidateBatch(batch);

        if (request.SessionsPerWeek < 1 ||
            request.SessionsPerWeek > 7)
        {
            throw new ArgumentException(
                "Sessions per week must be between 1 and 7."
            );
        }

        if (request.EndTime <= request.StartTime)
        {
            throw new ArgumentException(
                "End time must be later than start time."
            );
        }

        // Duration comes from TrainingProgram
        var requiredHours =
            (decimal)batch.TrainingProgram.DurationHours;

        var startDate =
            DateOnly.FromDateTime(batch.StartDate);

        var endDate =
            DateOnly.FromDateTime(batch.EndDate);

        var availableDays =
            GetAvailableTrainingDays(
                startDate,
                endDate,
                request.IncludeWeekends
            );

        if (availableDays.Count == 0)
        {
            throw new InvalidOperationException(
                "No available training days within the selected period."
            );
        }

        // --------------------------------------------------------
        // Calculate actual training hours per day
        // --------------------------------------------------------

        var dailyTrainingHours =
            CalculateDailyTrainingHours(
                request.StartTime,
                request.EndTime,
                batch.BreakHours
            );

        if (dailyTrainingHours <= 0)
        {
            throw new ArgumentException(
                "The training duration after break time must be greater than zero."
            );
        }

        // --------------------------------------------------------
        // Determine actual session dates
        // --------------------------------------------------------

        var sessionDates =
            SelectSessionDates(
                availableDays,
                request.SessionsPerWeek
            );

        if (sessionDates.Count == 0)
        {
            throw new InvalidOperationException(
                "Unable to generate training session dates."
            );
        }

        // --------------------------------------------------------
        // Check whether selected schedule can accommodate
        // required training hours
        // --------------------------------------------------------

        var maximumAvailableHours =
            sessionDates.Count *
            dailyTrainingHours;

        if (maximumAvailableHours < requiredHours)
        {
            throw new InvalidOperationException(
                $"The selected schedule can only provide " +
                $"{maximumAvailableHours:0.##} training hours, " +
                $"but {requiredHours:0.##} hours are required. " +
                "Increase sessions per week, extend the training period, " +
                "or increase the daily training hours."
            );
        }

        // --------------------------------------------------------
        // Remove previous generated schedule
        // --------------------------------------------------------

        if (batch.TrainingSessions.Any())
        {
            _context.TrainingSessions.RemoveRange(
                batch.TrainingSessions
            );
        }

        // --------------------------------------------------------
        // Generate sessions
        // --------------------------------------------------------

        var sessions =
            new List<TrainingSession>();

        decimal accumulatedHours = 0m;

        var sessionNumber = 1;

        foreach (var date in sessionDates)
        {
            if (accumulatedHours >= requiredHours)
            {
                break;
            }

            var remainingHours =
                requiredHours -
                accumulatedHours;

            /*
             * Normally the session receives the complete
             * daily training duration.
             *
             * The final session receives only the
             * remaining required hours.
             */

            var sessionDuration =
                Math.Min(
                    dailyTrainingHours,
                    remainingHours
                );

            sessionDuration =
                decimal.Round(
                    sessionDuration,
                    2,
                    MidpointRounding.AwayFromZero
                );

            var sessionEndTime =
                request.StartTime.AddHours(
                    (double)sessionDuration
                );

            var session =
                new TrainingSession
                {
                    Id = Guid.NewGuid(),

                    TrainingBatchId =
                        batch.Id,

                    SessionNumber =
                        sessionNumber,

                    SessionDate = DateTime.SpecifyKind(
    date.ToDateTime(request.StartTime),
    DateTimeKind.Utc
),

                    StartTime =
                        request.StartTime,

                    EndTime =
                        sessionEndTime,

                    DurationHours =
                        sessionDuration,

                    Status =
                        TrainingSessionStatus.Scheduled
                };

            sessions.Add(session);

            accumulatedHours +=
                sessionDuration;

            sessionNumber++;
        }

        // --------------------------------------------------------
        // Validate exact total
        // --------------------------------------------------------

        accumulatedHours =
            decimal.Round(
                accumulatedHours,
                2,
                MidpointRounding.AwayFromZero
            );

        var roundedRequiredHours =
            decimal.Round(
                requiredHours,
                2,
                MidpointRounding.AwayFromZero
            );

        if (accumulatedHours != roundedRequiredHours)
        {
            throw new InvalidOperationException(
                $"Unable to generate the complete training schedule. " +
                $"Generated {accumulatedHours:0.##} hours out of " +
                $"{roundedRequiredHours:0.##} required hours."
            );
        }

        // --------------------------------------------------------
        // Save generated schedule
        // --------------------------------------------------------

       

        return sessions
            .OrderBy(x => x.SessionNumber)
            .Select(MapToDto)
            .ToList();
    }

    // ============================================================
    // VALIDATE TRAINING BATCH
    // ============================================================

    private static void ValidateBatch(
        TrainingBatch batch)
    {
        if (batch.TrainingProgram == null)
        {
            throw new InvalidOperationException(
                "Training program associated with this batch was not found."
            );
        }

        if (batch.TrainingProgram.DurationHours <= 0)
        {
            throw new InvalidOperationException(
                "Training program duration must be greater than zero."
            );
        }

        if (batch.EndDate < batch.StartDate)
        {
            throw new InvalidOperationException(
                "Training end date cannot be earlier than start date."
            );
        }

        if (batch.StartTime.HasValue &&
            batch.EndTime.HasValue &&
            batch.EndTime <= batch.StartTime)
        {
            throw new InvalidOperationException(
                "Training end time must be later than start time."
            );
        }

        if (batch.BreakHours < 0)
        {
            throw new InvalidOperationException(
                "Break hours cannot be negative."
            );
        }
    }

    // ============================================================
    // CALCULATE AVAILABLE WEEKS
    // ============================================================

    private static int CalculateAvailableWeeks(
        DateOnly startDate,
        DateOnly endDate)
    {
        var totalDays =
            endDate.DayNumber -
            startDate.DayNumber +
            1;

        return Math.Max(
            1,
            (int)Math.Ceiling(
                totalDays / 7.0
            )
        );
    }

    // ============================================================
    // GET AVAILABLE TRAINING DAYS
    // ============================================================

    private static List<DateOnly>
        GetAvailableTrainingDays(
            DateOnly startDate,
            DateOnly endDate,
            bool includeWeekends)
    {
        var dates =
            new List<DateOnly>();

        for (
            var date = startDate;
            date <= endDate;
            date = date.AddDays(1)
        )
        {
            if (!includeWeekends &&
                (
                    date.DayOfWeek ==
                        DayOfWeek.Saturday ||
                    date.DayOfWeek ==
                        DayOfWeek.Sunday
                ))
            {
                continue;
            }

            dates.Add(date);
        }

        return dates;
    }

    // ============================================================
    // CALCULATE RECOMMENDATION
    // ============================================================

    private static (
        int SessionsPerWeek,
        decimal HoursPerSession,
        decimal WeeklyHours,
        int SessionCount
    )
    CalculateRecommendation(
        decimal requiredHours,
        int availableDays,
        int availableWeeks)
    {
        var candidates =
            new List<ScheduleCandidate>();

        /*
         * Test 1–7 sessions per week.
         *
         * Practical session range:
         *
         * Minimum = 2 hours
         * Maximum = 8 hours
         *
         * Ideal = 4–6 hours
         */

        for (
            var sessionsPerWeek = 1;
            sessionsPerWeek <= 7;
            sessionsPerWeek++
        )
        {
            var estimatedSessionCount =
                sessionsPerWeek *
                availableWeeks;

            estimatedSessionCount =
                Math.Min(
                    estimatedSessionCount,
                    availableDays
                );

            if (estimatedSessionCount <= 0)
            {
                continue;
            }

            var hoursPerSession =
                requiredHours /
                estimatedSessionCount;

            if (hoursPerSession < 2m ||
                hoursPerSession > 8m)
            {
                continue;
            }

            var weeklyHours =
                hoursPerSession *
                sessionsPerWeek;

            /*
             * Prefer approximately 4–6 hours/session.
             */

            var durationScore =
                CalculateDurationScore(
                    hoursPerSession
                );

            /*
             * Slight preference for fewer
             * sessions per week.
             */

            var frequencyScore =
                sessionsPerWeek * 0.10;

            var totalScore =
                durationScore +
                frequencyScore;

            candidates.Add(
                new ScheduleCandidate(
                    SessionsPerWeek:
                        sessionsPerWeek,

                    HoursPerSession:
                        hoursPerSession,

                    WeeklyHours:
                        weeklyHours,

                    SessionCount:
                        estimatedSessionCount,

                    Score:
                        totalScore
                )
            );
        }

        // --------------------------------------------------------
        // FALLBACK
        // --------------------------------------------------------

        if (candidates.Count == 0)
        {
            var sessionCount =
                Math.Min(
                    availableDays,
                    Math.Max(
                        1,
                        (int)Math.Ceiling(
                            requiredHours / 8m
                        )
                    )
                );

            var sessionsPerWeek =
                Math.Max(
                    1,
                    (int)Math.Ceiling(
                        (double)sessionCount /
                        availableWeeks
                    )
                );

            sessionsPerWeek =
                Math.Min(
                    sessionsPerWeek,
                    7
                );

            var hoursPerSession =
                requiredHours /
                sessionCount;

            return (
                sessionsPerWeek,

                decimal.Round(
                    hoursPerSession,
                    2,
                    MidpointRounding.AwayFromZero
                ),

                decimal.Round(
                    hoursPerSession *
                    sessionsPerWeek,
                    2,
                    MidpointRounding.AwayFromZero
                ),

                sessionCount
            );
        }

        var best =
            candidates
                .OrderBy(x => x.Score)
                .First();

        return (
            best.SessionsPerWeek,

            decimal.Round(
                best.HoursPerSession,
                2,
                MidpointRounding.AwayFromZero
            ),

            decimal.Round(
                best.WeeklyHours,
                2,
                MidpointRounding.AwayFromZero
            ),

            best.SessionCount
        );
    }

    // ============================================================
    // SCORE SESSION DURATION
    // ============================================================

    private static double CalculateDurationScore(
        decimal hours)
    {
        /*
         * Ideal range:
         * 4–6 hours/session
         */

        if (hours >= 4m &&
            hours <= 6m)
        {
            return 0;
        }

        if (hours < 4m)
        {
            return (double)(4m - hours);
        }

        return (double)(hours - 6m);
    }

    // ============================================================
    // SELECT SESSION DATES
    // ============================================================

    private static List<DateOnly>
        SelectSessionDates(
            List<DateOnly> availableDays,
            int sessionsPerWeek)
    {
        if (availableDays.Count == 0)
        {
            return [];
        }

        var result =
            new List<DateOnly>();

        /*
         * Group available dates by week.
         */

        var weeks =
            availableDays
                .GroupBy(
                    GetWeekKey
                )
                .OrderBy(
                    group => group.Key
                )
                .ToList();

        foreach (var week in weeks)
        {
            var days =
                week
                    .OrderBy(x => x)
                    .ToList();

            if (days.Count == 0)
            {
                continue;
            }

            var count =
                Math.Min(
                    sessionsPerWeek,
                    days.Count
                );

            // ----------------------------------------------------
            // One session per week
            // ----------------------------------------------------

            if (count == 1)
            {
                result.Add(
                    days[0]
                );

                continue;
            }

            // ----------------------------------------------------
            // Multiple sessions per week
            // ----------------------------------------------------

            for (
                var i = 0;
                i < count;
                i++
            )
            {
                var index =
                    (int)Math.Round(
                        i *
                        (days.Count - 1.0) /
                        (count - 1),
                        MidpointRounding.AwayFromZero
                    );

                index =
                    Math.Clamp(
                        index,
                        0,
                        days.Count - 1
                    );

                var selectedDate =
                    days[index];

                if (!result.Contains(
                        selectedDate))
                {
                    result.Add(
                        selectedDate
                    );
                }
            }
        }

        return result
            .OrderBy(x => x)
            .ToList();
    }

    // ============================================================
    // WEEK KEY
    // ============================================================

    private static int GetWeekKey(
        DateOnly date)
    {
        var difference =
            date.DayOfWeek switch
            {
                DayOfWeek.Monday => 0,

                DayOfWeek.Tuesday => -1,

                DayOfWeek.Wednesday => -2,

                DayOfWeek.Thursday => -3,

                DayOfWeek.Friday => -4,

                DayOfWeek.Saturday => -5,

                DayOfWeek.Sunday => -6,

                _ => 0
            };

        var monday =
            date.AddDays(
                difference
            );

        return monday.DayNumber;
    }

    // ============================================================
    // DAILY TRAINING HOURS
    // ============================================================

    private static decimal CalculateDailyTrainingHours(
        TimeOnly startTime,
        TimeOnly endTime,
        decimal breakHours)
    {
        var clockHours =
            (decimal)(
                endTime.ToTimeSpan() -
                startTime.ToTimeSpan()
            ).TotalHours;

        var trainingHours =
            clockHours -
            breakHours;

        return decimal.Round(
            trainingHours,
            2,
            MidpointRounding.AwayFromZero
        );
    }

    // ============================================================
    // MAP ENTITY TO DTO
    // ============================================================

    private static TrainingSessionDto
        MapToDto(
            TrainingSession session)
    {
        return new TrainingSessionDto
        {
            Id =
                session.Id,

            TrainingBatchId =
                session.TrainingBatchId,

            SessionNumber =
                session.SessionNumber,

            SessionDate =
                DateOnly.FromDateTime(
                    session.SessionDate
                ),

            StartTime =
                session.StartTime,

            EndTime =
                session.EndTime,

            DurationHours =
                session.DurationHours,

            Status =
                session.Status
        };
    }

    // ============================================================
    // INTERNAL RECORD
    // ============================================================

    private record ScheduleCandidate(
        int SessionsPerWeek,
        decimal HoursPerSession,
        decimal WeeklyHours,
        int SessionCount,
        double Score
    );

    // ============================================================
// GET TRAINING SCHEDULE
// ============================================================

public async Task<IReadOnlyList<TrainingSessionDto>>
    GetScheduleAsync(Guid trainingBatchId)
{
    var batch = await _context.TrainingBatches
        .Include(x => x.TrainingSessions)
        .FirstOrDefaultAsync(x => x.Id == trainingBatchId);

    if (batch == null)
    {
        throw new KeyNotFoundException(
            "Training batch not found."
        );
    }

    return batch.TrainingSessions
        .OrderBy(x => x.SessionNumber)
        .Select(MapToDto)
        .ToList();
}


// ============================================================
// APPROVE TRAINING SCHEDULE
// ============================================================
public async Task ApproveScheduleAsync(
    Guid trainingBatchId,
    IReadOnlyList<TrainingSessionDto> sessions)
{
    var batch = await _context.TrainingBatches
        .Include(x => x.TrainingSessions)
        .FirstOrDefaultAsync(x => x.Id == trainingBatchId);

    if (batch == null)
    {
        throw new KeyNotFoundException(
            "Training batch not found."
        );
    }

    if (sessions == null || sessions.Count == 0)
    {
        throw new InvalidOperationException(
            "Cannot approve a training schedule with no sessions."
        );
    }

    if (batch.ScheduleStatus == TrainingScheduleStatus.Approved)
    {
        throw new InvalidOperationException(
            "Training schedule has already been approved."
        );
    }

    // Remove existing sessions if there are any
    if (batch.TrainingSessions.Any())
    {
        _context.TrainingSessions.RemoveRange(
            batch.TrainingSessions
        );
    }

    // Convert preview sessions into database entities
    var approvedSessions = sessions
        .OrderBy(x => x.SessionNumber)
        .Select(x => new TrainingSession
        {
            Id = Guid.NewGuid(),

            TrainingBatchId =
                batch.Id,

            SessionNumber =
                x.SessionNumber,

            SessionDate =
                DateTime.SpecifyKind(
                    x.SessionDate.ToDateTime(x.StartTime),
                    DateTimeKind.Utc
                ),

            StartTime =
                x.StartTime,

            EndTime =
                x.EndTime,

            DurationHours =
                x.DurationHours,

            Status =
                TrainingSessionStatus.Scheduled
        })
        .ToList();

    await _context.TrainingSessions
        .AddRangeAsync(approvedSessions);

    // Only now is the schedule official
    batch.ScheduleStatus =
        TrainingScheduleStatus.Approved;

    await _context.SaveChangesAsync();
}
// ============================================================
// GET PARTICIPANT TRAINING SCHEDULE
// ============================================================

public async Task<IReadOnlyList<TrainingSessionDto>>
    GetParticipantScheduleAsync(
        Guid trainingBatchId,
        Guid participantUserId)
{
    var isEnrolled = await _context.Enrollments
        .AnyAsync(x =>
            x.TrainingBatchId == trainingBatchId &&
            x.ParticipantProfile.UserId == participantUserId &&
            x.Status == EnrollmentStatus.Approved);

    if (!isEnrolled)
    {
        throw new UnauthorizedAccessException(
            "You are not enrolled in this training batch."
        );
    }

    var sessions = await _context.TrainingSessions
        .Where(x =>
            x.TrainingBatchId == trainingBatchId)
        .OrderBy(x => x.SessionNumber)
        .ToListAsync();

    return sessions
        .Select(MapToDto)
        .ToList();
}
}