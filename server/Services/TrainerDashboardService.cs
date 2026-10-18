
using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.TrainerDashboard;
using server.Enums;
using server.Interfaces;
using server.Services.Interfaces;

namespace server.Services;

public class TrainerDashboardService : ITrainerDashboardService
{
    private readonly ApplicationDbContext _context;
    private readonly ICacheService _cacheService;

    private static readonly TimeSpan CacheExpiration =
        TimeSpan.FromSeconds(30);

    private static string GetDashboardCacheKey(Guid trainerUserId)
        => $"trainer:dashboard:user:{trainerUserId}";

    public TrainerDashboardService(
        ApplicationDbContext context,
        ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    public async Task<TrainerDashboardDto> GetDashboardAsync(
        Guid trainerUserId)
    {
        // =========================================================
        // CHECK CACHE
        // =========================================================

        var cacheKey = GetDashboardCacheKey(trainerUserId);

        if (_cacheService.TryGet<TrainerDashboardDto>(
                cacheKey,
                out var cachedDashboard))
        {
            return cachedDashboard!;
        }

        // =========================================================
        // CURRENT TIME
        // =========================================================

        var nowUtc = DateTime.UtcNow;
        var localNow = nowUtc.ToLocalTime();
        var today = localNow.Date;
        var currentTime = TimeOnly.FromDateTime(localNow);

        // =========================================================
        // GET TRAINER'S ACTIVE ASSIGNMENT
        // =========================================================

        var assignment = await _context.TrainerAssignments
            .AsNoTracking()
            .Include(x => x.TrainingBatch)
                .ThenInclude(x => x.TrainingProgram)
            .Include(x => x.TrainerProfile)
            .Where(x =>
                x.IsActive &&
                x.TrainerProfile.UserId == trainerUserId)
            .OrderByDescending(x => x.AssignedAt)
            .FirstOrDefaultAsync();

        // =========================================================
        // NO ACTIVE ASSIGNMENT
        // =========================================================

        if (assignment == null)
        {
            var emptyDashboard = new TrainerDashboardDto
            {
                Training = null,
                Stats = new TrainerDashboardStatsDto(),
                TodaySession = null,
                Attendance = new TrainerDashboardAttendanceDto(),
                UpcomingSessions = []
            };

            _cacheService.Set(
                cacheKey,
                emptyDashboard,
                CacheExpiration);

            return emptyDashboard;
        }

        // =========================================================
        // ASSIGNED TRAINING BATCH
        // =========================================================

        var batch = assignment.TrainingBatch;
        var batchId = batch.Id;

        // =========================================================
        // GET PARTICIPANT ENROLLMENTS
        // =========================================================

        var enrollments = await _context.Enrollments
            .AsNoTracking()
            .Where(x =>
                x.TrainingBatchId == batchId &&
                x.Status != EnrollmentStatus.Rejected &&
                x.Status != EnrollmentStatus.Cancelled)
            .Select(x => x.ParticipantProfileId)
            .Distinct()
            .ToListAsync();

        var totalParticipants = enrollments.Count;

        // =========================================================
        // GET TRAINING SESSIONS
        // =========================================================

        var sessions = await _context.TrainingSessions
            .AsNoTracking()
            .Where(x => x.TrainingBatchId == batchId)
            .OrderBy(x => x.SessionDate)
            .ThenBy(x => x.StartTime)
            .ToListAsync();

        // =========================================================
        // SESSION COUNTS
        // =========================================================

        var totalSessions = sessions.Count;

        var completedSessions = sessions.Count(x =>
            x.SessionDate.Date < today ||
            (
                x.SessionDate.Date == today &&
                x.EndTime <= currentTime
            ));

        var sessionProgress = totalSessions > 0
            ? Math.Round(
                completedSessions / (double)totalSessions * 100,
                2)
            : 0;

        // =========================================================
        // TRAINING STATUS
        // =========================================================

        string trainingStatus;

        if (batch.EndDate < nowUtc)
        {
            trainingStatus = "Completed";
        }
        else if (
            batch.StartDate <= nowUtc &&
            batch.EndDate >= nowUtc)
        {
            trainingStatus = "Ongoing";
        }
        else
        {
            trainingStatus = "Upcoming";
        }

        // =========================================================
        // GET ATTENDANCE RECORDS
        // =========================================================

        var attendanceRecords = await _context.AttendanceRecords
            .AsNoTracking()
            .Where(x =>
                x.Enrollment.TrainingBatchId == batchId)
            .Select(x => x.Status)
            .ToListAsync();

        // =========================================================
        // ATTENDANCE COUNTS
        // =========================================================

        var present = attendanceRecords.Count(
            x => x == AttendanceStatus.Present);

        var late = attendanceRecords.Count(
            x => x == AttendanceStatus.Late);

        var absent = attendanceRecords.Count(
            x => x == AttendanceStatus.Absent);

        var totalRecorded = present + late + absent;

        // =========================================================
        // ATTENDANCE RATE
        // =========================================================

        var attendanceRate = totalRecorded > 0
            ? Math.Round(
                (present + late) / (double)totalRecorded * 100,
                2)
            : 0;

        // =========================================================
        // TODAY'S SESSION
        // =========================================================

        var todaySession = sessions
            .Where(x => x.SessionDate.Date == today)
            .OrderBy(x => x.StartTime)
            .FirstOrDefault();

        TrainerDashboardSessionDto? todaySessionDto = null;

        if (todaySession != null)
        {
            string sessionStatus;

            if (currentTime < todaySession.StartTime)
            {
                sessionStatus = "Upcoming";
            }
            else if (
                currentTime >= todaySession.StartTime &&
                currentTime <= todaySession.EndTime)
            {
                sessionStatus = "Ongoing";
            }
            else
            {
                sessionStatus = "Completed";
            }

            var attendanceIsOpen =
                await _context.AttendanceSessions
                    .AsNoTracking()
                    .AnyAsync(x =>
                        x.TrainingSessionId == todaySession.Id &&
                        x.Status == AttendanceSessionStatus.Open);

            todaySessionDto = new TrainerDashboardSessionDto
            {
                TrainingSessionId = todaySession.Id,
                Title = "Training Session",
                SessionDate = todaySession.SessionDate,
                StartTime = todaySession.StartTime,
                EndTime = todaySession.EndTime,
                Status = sessionStatus,
                AttendanceOpen = attendanceIsOpen
            };
        }

        // =========================================================
        // UPCOMING SESSIONS
        // =========================================================

        var upcomingSessions = sessions
            .Where(x =>
                x.SessionDate.Date > today ||
                (
                    x.SessionDate.Date == today &&
                    x.StartTime > currentTime
                ))
            .Take(5)
            .Select(x => new TrainerDashboardUpcomingSessionDto
            {
                TrainingSessionId = x.Id,
                SessionDate = x.SessionDate,
                StartTime = x.StartTime,
                EndTime = x.EndTime,
                Title = "Training Session"
            })
            .ToList();

        // =========================================================
        // BUILD DASHBOARD RESPONSE
        // =========================================================

        var dashboard = new TrainerDashboardDto
        {
            Training = new TrainerDashboardTrainingDto
            {
                TrainingBatchId = batchId,
                TrainingName = batch.TrainingProgram.Name,
                BatchName = batch.BatchCode,
                Status = trainingStatus,
                StartDate = batch.StartDate,
                EndDate = batch.EndDate,
                ParticipantCount = totalParticipants
            },

            Stats = new TrainerDashboardStatsDto
            {
                TotalParticipants = totalParticipants,
                TotalSessions = totalSessions,
                CompletedSessions = completedSessions,
                SessionProgress = sessionProgress,
                AttendanceRate = attendanceRate
            },

            TodaySession = todaySessionDto,

            Attendance = new TrainerDashboardAttendanceDto
            {
                Present = present,
                Late = late,
                Absent = absent,
                TotalRecorded = totalRecorded,
                AttendanceRate = attendanceRate
            },

            UpcomingSessions = upcomingSessions
        };

        // =========================================================
        // SAVE TO CACHE
        // =========================================================

        _cacheService.Set(
            cacheKey,
            dashboard,
            CacheExpiration);

        return dashboard;
    }
}
