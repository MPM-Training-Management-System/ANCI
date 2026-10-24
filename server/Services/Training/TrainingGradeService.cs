
using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Training;
using server.Enums;
using server.Interfaces;
using server.Models.Training;

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

    private const decimal PresentValue = 1.00m;
    private const decimal LateValue = 0.50m;
    private const decimal AbsentValue = 0.00m;

    // =========================================================
    // PASSING GRADE
    // =========================================================

    private const decimal OverallPassingGrade = 75m;

    // =========================================================
    // CACHE CONFIGURATION
    // =========================================================

    private const string GradeCachePrefix = "training-grades:";

    private static readonly TimeSpan GradeCacheExpiration =
        TimeSpan.FromMinutes(5);

    // =========================================================
    // DATABASE AND CACHE
    // =========================================================

    private readonly ApplicationDbContext _db;
    private readonly ICacheService _cache;

    public TrainingGradeService(
        ApplicationDbContext db,
        ICacheService cache)
    {
        _db = db;
        _cache = cache;
    }

    // =========================================================
    // GET GRADE BY ENROLLMENT
    // =========================================================

    public async Task<TrainingGradeDto?> GetByEnrollmentAsync(
        Guid enrollmentId)
    {
        var cacheKey =
            $"{GradeCachePrefix}enrollment:{enrollmentId}";

        // -----------------------------------------------------
        // CHECK CACHE
        // -----------------------------------------------------

        if (_cache.TryGet<TrainingGradeDto>(
                cacheKey,
                out var cachedGrade) &&
            cachedGrade is not null)
        {
            return cachedGrade;
        }

        // -----------------------------------------------------
        // GET ENROLLMENT
        // -----------------------------------------------------

        var enrollment = await _db.Enrollments
            .AsNoTracking()
            .Include(x => x.TrainingBatch)
                .ThenInclude(x => x.TrainingProgram)
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

        var attendanceWeighted = Math.Round(
            attendancePercentage * AttendanceWeight,
            2);

        var participationWeighted = Math.Round(
            participationPercentage * ParticipationWeight,
            2);

        var examWeighted = Math.Round(
            examPercentage * ExamWeight,
            2);

        var practicalWeighted = Math.Round(
            practicalPercentage * PracticalWeight,
            2);

        // =====================================================
        // OVERALL GRADE
        // =====================================================

        var overall = Math.Round(
            attendanceWeighted +
            participationWeighted +
            examWeighted +
            practicalWeighted,
            2);

        var isPassed = overall >= OverallPassingGrade;

        // =====================================================
        // BUILD DTO
        // =====================================================

        var grade = new TrainingGradeDto
        {
            EnrollmentId = enrollment.Id,
            TrainingBatchId = enrollment.TrainingBatchId,

            Name = enrollment.TrainingBatch
                .TrainingProgram.Name,

            ProgramCode = enrollment.TrainingBatch?.BatchCode,

            ParticipantName =
                enrollment.ParticipantProfile?.User?.FullName,

            UserCode =
                enrollment.ParticipantProfile?.User?.UserCode,

            ProfileImageUrl =
                enrollment.ParticipantProfile?.ProfileImageUrl,

            AttendancePercentage = attendancePercentage,
            AttendanceWeight = 20m,
            AttendanceWeightedScore = attendanceWeighted,

            ParticipationPercentage = participationPercentage,
            ParticipationWeight = 20m,
            ParticipationWeightedScore = participationWeighted,

            ExamPercentage = examPercentage,
            ExamWeight = 30m,
            ExamWeightedScore = examWeighted,

            PracticalPercentage = practicalPercentage,
            PracticalWeight = 30m,
            PracticalWeightedScore = practicalWeighted,

            OverallGrade = overall,
            IsPassed = isPassed
        };

        // -----------------------------------------------------
        // SAVE TO CACHE
        // -----------------------------------------------------

        _cache.Set(
            cacheKey,
            grade,
            GradeCacheExpiration);

        return grade;
    }

    // =========================================================
    // ATTENDANCE CALCULATION
    // =========================================================

    private async Task<decimal> CalculateAttendanceAsync(
        Guid enrollmentId,
        Guid trainingBatchId)
    {
        var totalSessions =
            await _db.AttendanceSessions
                .AsNoTracking()
                .CountAsync(x =>
                    x.TrainingBatchId == trainingBatchId);

        if (totalSessions == 0)
        {
            return 0m;
        }

        var attendanceStatuses =
            await _db.AttendanceRecords
                .AsNoTracking()
                .Where(x =>
                    x.EnrollmentId == enrollmentId &&
                    x.AttendanceSession.TrainingBatchId ==
                        trainingBatchId)
                .Select(x => new
                {
                    x.AttendanceSessionId,
                    x.Status
                })
                .ToListAsync();

        // Only one attendance result per session.
        var sessionStatuses = attendanceStatuses
            .GroupBy(x => x.AttendanceSessionId)
            .Select(group => group
                .OrderByDescending(x =>
                    GetAttendanceStatusPriority(x.Status))
                .First())
            .ToList();

        decimal attendancePoints = 0m;

        foreach (var attendance in sessionStatuses)
        {
            attendancePoints +=
                GetAttendanceValue(attendance.Status);
        }

        var percentage =
            attendancePoints * 100m / totalSessions;

        return Math.Round(
            Math.Min(Math.Max(percentage, 0m), 100m),
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
            AttendanceStatus.Present => PresentValue,
            AttendanceStatus.Late => LateValue,
            _ => AbsentValue
        };
    }

    // =========================================================
    // ATTENDANCE STATUS PRIORITY
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
                    x.TrainingBatchId == trainingBatchId);

        if (setting is null ||
            setting.RequiredRecitations <= 0)
        {
            return 0m;
        }

        var actualRecitations =
            await _db.ParticipationRecords
                .AsNoTracking()
                .Where(x =>
                    x.EnrollmentId == enrollmentId &&
                    x.TrainingSession.TrainingBatchId ==
                        trainingBatchId)
                .CountAsync();

        return Math.Round(
            Math.Min(
                actualRecitations * 100m /
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
                    .ThenInclude(x => x.WrittenAssessment)
                .Where(x =>
                    x.AssessmentAttempt.EnrollmentId ==
                        enrollmentId &&
                    x.AssessmentAttempt.WrittenAssessment
                        .TrainingBatchId == trainingBatchId)
                .OrderByDescending(x => x.EvaluatedAt)
                .Select(x => (decimal?)x.Percentage)
                .FirstOrDefaultAsync();

        return Clamp(result ?? 0m);
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
                .Where(x => x.EnrollmentId == enrollmentId)
                .OrderByDescending(x => x.EvaluatedAt)
                .Select(x => (decimal?)x.Percentage)
                .FirstOrDefaultAsync();

        return Clamp(result ?? 0m);
    }

    // =========================================================
    // CLAMP
    // =========================================================

    private static decimal Clamp(decimal value)
    {
        return Math.Round(
            Math.Min(Math.Max(value, 0m), 100m),
            2);
    }

    // =========================================================
    // GET ALL GRADES
    // =========================================================

    public async Task<IReadOnlyList<TrainingGradeDto>>
        GetAllAsync()
    {
        const string cacheKey = $"{GradeCachePrefix}all";

        // -----------------------------------------------------
        // CHECK CACHE
        // -----------------------------------------------------

        if (_cache.TryGet<
                IReadOnlyList<TrainingGradeDto>>(
                cacheKey,
                out var cachedGrades) &&
            cachedGrades is not null)
        {
            return cachedGrades;
        }

        // -----------------------------------------------------
        // GET APPROVED ENROLLMENTS
        // -----------------------------------------------------

        var enrollments =
            await _db.Enrollments
                .AsNoTracking()
                .Include(x => x.TrainingBatch)
                .Include(x => x.ParticipantProfile)
                    .ThenInclude(x => x.User)
                .Where(x =>
                    x.Status == EnrollmentStatus.Approved)
                .OrderBy(x => x.TrainingBatch.BatchCode)
                .ThenBy(x =>
                    x.ParticipantProfile.User.FullName)
                .ToListAsync();

        // -----------------------------------------------------
        // CALCULATE GRADES
        // -----------------------------------------------------

        var grades = new List<TrainingGradeDto>();

        foreach (var enrollment in enrollments)
        {
            var grade = await GetByEnrollmentAsync(
                enrollment.Id);

            if (grade is not null)
            {
                grades.Add(grade);
            }
        }

        // -----------------------------------------------------
        // SAVE ALL GRADES TO CACHE
        // -----------------------------------------------------

        IReadOnlyList<TrainingGradeDto> result = grades;

        _cache.Set(
            cacheKey,
            result,
            GradeCacheExpiration);

        return result;
    }

    // =========================================================
    // INVALIDATE GRADE CACHE
    // =========================================================

    public void InvalidateGradeCache()
    {
        _cache.RemoveByPrefix(GradeCachePrefix);
    }
}
