using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Training;
using server.Enums;

namespace server.Services.Training;

public class TrainingGradeService : ITrainingGradeService
{
    // =========================================================
    // GRADING WEIGHTS
    // =========================================================

    private const decimal AttendanceWeight = 0.20m;
    private const decimal ParticipationWeight = 0.20m;
    private const decimal ExamWeight = 0.30m;
    private const decimal PracticalWeight = 0.30m;

    // =========================================================
    // ATTENDANCE VALUES
    // =========================================================
    // Present = full attendance
    // Late    = half attendance
    // Absent  = zero attendance
    //
    // Example:
    // 5 sessions
    // 3 Present = 3.00
    // 1 Late    = 0.50
    // 1 Absent  = 0.00
    //
    // Total = 3.50 / 5 = 70%
    // =========================================================

    private const decimal PresentValue = 1.00m;
    private const decimal LateValue = 0.50m;
    private const decimal AbsentValue = 0.00m;

    // =========================================================
    // PASSING GRADE
    // =========================================================

    private const decimal OverallPassingGrade = 75m;

    // =========================================================
    // DATABASE
    // =========================================================

    private readonly ApplicationDbContext _db;

    public TrainingGradeService(ApplicationDbContext db)
    {
        _db = db;
    }

    // =========================================================
    // GET GRADE BY ENROLLMENT
    // =========================================================

    public async Task<TrainingGradeDto?> GetByEnrollmentAsync(
        Guid enrollmentId)
    {
        var enrollment = await _db.Enrollments
            .AsNoTracking()
            .Include(x => x.TrainingBatch)
            .Include(x => x.ParticipantProfile)
                .ThenInclude(x => x.User)
            .FirstOrDefaultAsync(x => x.Id == enrollmentId);

        if (enrollment is null)
        {
            return null;
        }

        // =====================================================
        // ATTENDANCE
        // =====================================================

        var attendancePercentage =
            await CalculateAttendanceAsync(
                enrollment.Id,
                enrollment.TrainingBatchId);

        // =====================================================
        // PARTICIPATION
        // =====================================================

        var participationPercentage =
            await CalculateParticipationAsync(
                enrollment.Id,
                enrollment.TrainingBatchId);

        // =====================================================
        // EXAM
        // =====================================================

        var examPercentage =
            await CalculateExamAsync(
                enrollment.Id,
                enrollment.TrainingBatchId);

        // =====================================================
        // PRACTICAL
        // =====================================================

        var practicalPercentage =
            await CalculatePracticalAsync(
                enrollment.Id);

        // =====================================================
        // WEIGHTED SCORES
        // =====================================================

        var attendanceWeighted =
            Math.Round(
                attendancePercentage *
                AttendanceWeight,
                2);

        var participationWeighted =
            Math.Round(
                participationPercentage *
                ParticipationWeight,
                2);

        var examWeighted =
            Math.Round(
                examPercentage *
                ExamWeight,
                2);

        var practicalWeighted =
            Math.Round(
                practicalPercentage *
                PracticalWeight,
                2);

        // =====================================================
        // OVERALL GRADE
        // =====================================================

        var overall =
            Math.Round(
                attendanceWeighted +
                participationWeighted +
                examWeighted +
                practicalWeighted,
                2);

        var isPassed =
            overall >= OverallPassingGrade;

        // =====================================================
        // RETURN DTO
        // =====================================================

        return new TrainingGradeDto
        {
            EnrollmentId =
                enrollment.Id,

            TrainingBatchId =
                enrollment.TrainingBatchId,

            BatchCode =
                enrollment.TrainingBatch?.BatchCode,

            ParticipantName =
                enrollment.ParticipantProfile?
                    .User?
                    .FullName,

            ProfileImageUrl =
                enrollment.ParticipantProfile?
                    .ProfileImageUrl,

            // -------------------------------------------------
            // ATTENDANCE
            // -------------------------------------------------

            AttendancePercentage =
                attendancePercentage,

            AttendanceWeight =
                20m,

            AttendanceWeightedScore =
                attendanceWeighted,

            // -------------------------------------------------
            // PARTICIPATION
            // -------------------------------------------------

            ParticipationPercentage =
                participationPercentage,

            ParticipationWeight =
                20m,

            ParticipationWeightedScore =
                participationWeighted,

            // -------------------------------------------------
            // EXAM
            // -------------------------------------------------

            ExamPercentage =
                examPercentage,

            ExamWeight =
                30m,

            ExamWeightedScore =
                examWeighted,

            // -------------------------------------------------
            // PRACTICAL
            // -------------------------------------------------

            PracticalPercentage =
                practicalPercentage,

            PracticalWeight =
                30m,

            PracticalWeightedScore =
                practicalWeighted,

            // -------------------------------------------------
            // OVERALL
            // -------------------------------------------------

            OverallGrade =
                overall,

            IsPassed =
                isPassed,
        };
    }

    // =========================================================
    // ATTENDANCE CALCULATION
    // =========================================================
    //
    // Each session is counted individually.
    //
    // Present = 1.00
    // Late    = 0.50
    // Absent  = 0.00
    //
    // Example:
    //
    // 5 sessions
    //
    // Session 1 = Present = 1.00
    // Session 2 = Present = 1.00
    // Session 3 = Late    = 0.50
    // Session 4 = Present = 1.00
    // Session 5 = Absent  = 0.00
    //
    // Total attendance points = 3.50
    //
    // Attendance percentage:
    //
    // 3.50 / 5 × 100 = 70%
    //
    // Attendance weighted:
    //
    // 70 × 0.20 = 14.00
    //
    // =========================================================

    private async Task<decimal> CalculateAttendanceAsync(
        Guid enrollmentId,
        Guid trainingBatchId)
    {
        // -----------------------------------------------------
        // GET ALL SESSIONS FOR THE TRAINING BATCH
        // -----------------------------------------------------
        //
        // Every AttendanceSession represents one session.
        //
        // If the batch has 5 sessions:
        //
        // totalSessions = 5
        //
        // -----------------------------------------------------

        var totalSessions =
            await _db.AttendanceSessions
                .AsNoTracking()
                .CountAsync(x =>
                    x.TrainingBatchId ==
                    trainingBatchId);

        if (totalSessions == 0)
        {
            return 0m;
        }

        // -----------------------------------------------------
        // GET PARTICIPANT ATTENDANCE RECORDS
        // -----------------------------------------------------
        //
        // We don't simply count Present/Late anymore.
        //
        // Instead:
        //
        // Present = 1.00
        // Late    = 0.50
        // Absent  = 0.00
        //
        // We retrieve the statuses and calculate the values
        // individually below.
        //
        // -----------------------------------------------------

        var attendanceStatuses =
            await _db.AttendanceRecords
                .AsNoTracking()
                .Where(x =>
                    x.EnrollmentId ==
                    enrollmentId &&

                    x.AttendanceSession.TrainingBatchId ==
                    trainingBatchId)
                .Select(x => new
                {
                    x.AttendanceSessionId,
                    x.Status
                })
                .ToListAsync();

        // -----------------------------------------------------
        // CALCULATE ATTENDANCE POINTS
        // -----------------------------------------------------

        decimal attendancePoints = 0m;

        // -----------------------------------------------------
        // DISTINCT SESSION RECORDS
        // -----------------------------------------------------
        //
        // A participant should only receive attendance credit
        // once per session.
        //
        // This prevents duplicate attendance records from
        // accidentally increasing the attendance score.
        //
        // -----------------------------------------------------

        var sessionStatuses =
            attendanceStatuses
                .GroupBy(x => x.AttendanceSessionId)
                .Select(group => group
                    .OrderByDescending(x =>
                        GetAttendanceStatusPriority(
                            x.Status))
                    .First())
                .ToList();

        // -----------------------------------------------------
        // APPLY ATTENDANCE VALUES
        // -----------------------------------------------------

        foreach (var attendance in sessionStatuses)
        {
            attendancePoints +=
                GetAttendanceValue(
                    attendance.Status);
        }

        // -----------------------------------------------------
        // CALCULATE PERCENTAGE
        // -----------------------------------------------------
        //
        // Example:
        //
        // 5 total sessions
        // 3.5 attendance points
        //
        // 3.5 / 5 × 100
        // = 70%
        //
        // -----------------------------------------------------

        var percentage =
            attendancePoints *
            100m /
            totalSessions;

        return Math.Round(
            Math.Min(
                Math.Max(
                    percentage,
                    0m),
                100m),
            2);
    }

    // =========================================================
    // ATTENDANCE VALUE
    // =========================================================

    private static decimal GetAttendanceValue(
        AttendanceStatus status)
    {
        return status switch
        {
            AttendanceStatus.Present =>
                PresentValue,

            AttendanceStatus.Late =>
                LateValue,

            _ =>
                AbsentValue
        };
    }

    // =========================================================
    // ATTENDANCE STATUS PRIORITY
    // =========================================================
    //
    // This is used only if duplicate attendance records exist
    // for the same enrollment + session.
    //
    // Present has the highest priority.
    // Late comes next.
    // Other statuses receive zero.
    //
    // =========================================================

    private static int GetAttendanceStatusPriority(
        AttendanceStatus status)
    {
        return status switch
        {
            AttendanceStatus.Present => 3,
            AttendanceStatus.Late => 2,
            _ => 1
        };
    }

    // =========================================================
    // PARTICIPATION CALCULATION
    // =========================================================

    private async Task<decimal> CalculateParticipationAsync(
        Guid enrollmentId,
        Guid trainingBatchId)
    {
        var setting =
            await _db.ParticipationSettings
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.TrainingBatchId ==
                    trainingBatchId);

        if (setting is null ||
            setting.RequiredRecitations <= 0)
        {
            return 0m;
        }

        var actualRecitations =
            await _db.ParticipationRecords
                .AsNoTracking()
                .Where(x =>
                    x.EnrollmentId ==
                    enrollmentId &&

                    x.TrainingSession.TrainingBatchId ==
                    trainingBatchId)
                .CountAsync();

        return Math.Round(
            Math.Min(
                actualRecitations *
                    100m /
                    setting.RequiredRecitations,
                100m),
            2);
    }

    // =========================================================
    // EXAM CALCULATION
    // =========================================================

    private async Task<decimal> CalculateExamAsync(
        Guid enrollmentId,
        Guid trainingBatchId)
    {
        var result =
            await _db.AssessmentResults
                .AsNoTracking()
                .Include(x => x.AssessmentAttempt)
                    .ThenInclude(x =>
                        x.WrittenAssessment)
                .Where(x =>
                    x.AssessmentAttempt.EnrollmentId ==
                    enrollmentId &&

                    x.AssessmentAttempt.WrittenAssessment
                        .TrainingBatchId ==
                    trainingBatchId)
                .OrderByDescending(x =>
                    x.EvaluatedAt)
                .Select(x =>
                    (decimal?)x.Percentage)
                .FirstOrDefaultAsync();

        return Clamp(
            result ?? 0m);
    }

    // =========================================================
    // PRACTICAL CALCULATION
    // =========================================================

    private async Task<decimal> CalculatePracticalAsync(
        Guid enrollmentId)
    {
        var result =
            await _db.PracticalAssessmentResults
                .AsNoTracking()
                .Where(x =>
                    x.EnrollmentId ==
                    enrollmentId)
                .OrderByDescending(x =>
                    x.EvaluatedAt)
                .Select(x =>
                    (decimal?)x.Percentage)
                .FirstOrDefaultAsync();

        return Clamp(
            result ?? 0m);
    }

    // =========================================================
    // CLAMP
    // =========================================================

    private static decimal Clamp(
        decimal value)
    {
        return Math.Round(
            Math.Min(
                Math.Max(
                    value,
                    0m),
                100m),
            2);
    }

    // =========================================================
    // GET ALL GRADES
    // =========================================================

    public async Task<IReadOnlyList<TrainingGradeDto>>
        GetAllAsync()
    {
        var enrollments =
            await _db.Enrollments
                .AsNoTracking()
                .Include(x => x.TrainingBatch)
                .Include(x => x.ParticipantProfile)
                    .ThenInclude(x => x.User)
                .Where(x =>
                    x.Status ==
                    EnrollmentStatus.Approved)
                .OrderBy(x =>
                    x.TrainingBatch.BatchCode)
                .ThenBy(x =>
                    x.ParticipantProfile.User.FullName)
                .ToListAsync();

        var grades =
            new List<TrainingGradeDto>();

        foreach (var enrollment in enrollments)
        {
            var grade =
                await GetByEnrollmentAsync(
                    enrollment.Id);

            if (grade is not null)
            {
                grades.Add(grade);
            }
        }

        return grades;
    }
}