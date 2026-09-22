using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Training;
using server.Enums;
using server.Models.Attendance;

namespace server.Services.Training;

public class TrainingGradeService : ITrainingGradeService
{
    private const decimal AttendanceWeight = 0.20m;
    private const decimal ParticipationWeight = 0.20m;
    private const decimal ExamWeight = 0.30m;
    private const decimal PracticalWeight = 0.30m;

    private readonly ApplicationDbContext _db;

    public TrainingGradeService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<TrainingGradeDto?> GetByEnrollmentAsync(Guid enrollmentId)
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

        var attendancePercentage = await CalculateAttendanceAsync(
            enrollment.Id,
            enrollment.TrainingBatchId);

        var participationPercentage = await CalculateParticipationAsync(
            enrollment.Id,
            enrollment.TrainingBatchId);
var examPercentage = await CalculateExamAsync(
    enrollment.Id,
    enrollment.TrainingBatchId);

        var practicalPercentage = await CalculatePracticalAsync(enrollment.Id);

        var attendanceWeighted = Math.Round(
            attendancePercentage * AttendanceWeight, 2);

        var participationWeighted = Math.Round(
            participationPercentage * ParticipationWeight, 2);

        var examWeighted = Math.Round(
            examPercentage * ExamWeight, 2);

        var practicalWeighted = Math.Round(
            practicalPercentage * PracticalWeight, 2);

        var overall = Math.Round(
            attendanceWeighted +
            participationWeighted +
            examWeighted +
            practicalWeighted,
            2);
        const decimal overallPassingGrade = 75m;

        var isPassed = overall >= overallPassingGrade;

        return new TrainingGradeDto
        {
            EnrollmentId = enrollment.Id,
            TrainingBatchId = enrollment.TrainingBatchId,
            BatchCode = enrollment.TrainingBatch?.BatchCode,
            ParticipantName = enrollment.ParticipantProfile?.User?.FullName,
            ProfileImageUrl = enrollment.ParticipantProfile?.ProfileImageUrl,
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
            IsPassed = isPassed,
           
        };
    }

    private async Task<decimal> CalculateAttendanceAsync(
        Guid enrollmentId,
        Guid trainingBatchId)
    {
        var totalSessions = await _db.AttendanceSessions
            .AsNoTracking()
            .CountAsync(x => x.TrainingBatchId == trainingBatchId);

        if (totalSessions == 0)
        {
            return 0m;
        }

        var attendedSessions = await _db.AttendanceRecords
            .AsNoTracking()
            .Where(x =>
                x.EnrollmentId == enrollmentId &&
                x.AttendanceSession.TrainingBatchId == trainingBatchId &&
                (x.Status == AttendanceStatus.Present ||
                 x.Status == AttendanceStatus.Late))
            .Select(x => x.AttendanceSessionId)
            .Distinct()
            .CountAsync();

        return Math.Round(
            Math.Min(attendedSessions * 100m / totalSessions, 100m),
            2);
    }

    private async Task<decimal> CalculateParticipationAsync(
        Guid enrollmentId,
        Guid trainingBatchId)
    {
        var setting = await _db.ParticipationSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.TrainingBatchId == trainingBatchId);

        if (setting is null || setting.RequiredRecitations <= 0)
        {
            return 0m;
        }

        var actualRecitations = await _db.ParticipationRecords
            .AsNoTracking()
            .Where(x =>
                x.EnrollmentId == enrollmentId &&
                x.TrainingSession.TrainingBatchId == trainingBatchId)
            .CountAsync();

        return Math.Round(
            Math.Min(
                actualRecitations * 100m / setting.RequiredRecitations,
                100m),
            2);
    }
private async Task<decimal> CalculateExamAsync(
    Guid enrollmentId,
    Guid trainingBatchId)
{
    var result = await _db.AssessmentResults
        .AsNoTracking()
        .Include(x => x.AssessmentAttempt)
            .ThenInclude(x => x.WrittenAssessment)
        .Where(x =>
            x.AssessmentAttempt.EnrollmentId == enrollmentId &&
            x.AssessmentAttempt.WrittenAssessment.TrainingBatchId == trainingBatchId)
        .OrderByDescending(x => x.EvaluatedAt)
        .Select(x => (decimal?)x.Percentage)
        .FirstOrDefaultAsync();

    return Clamp(result ?? 0m);
}

    private async Task<decimal> CalculatePracticalAsync(Guid enrollmentId)
    {
        var result = await _db.PracticalAssessmentResults
            .AsNoTracking()
            .Where(x => x.EnrollmentId == enrollmentId)
            .OrderByDescending(x => x.EvaluatedAt)
            .Select(x => (decimal?)x.Percentage)
            .FirstOrDefaultAsync();

        return Clamp(result ?? 0m);
    }

    private static decimal Clamp(decimal value)
    {
        return Math.Round(Math.Min(Math.Max(value, 0m), 100m), 2);
    }
public async Task<IReadOnlyList<TrainingGradeDto>> GetAllAsync()
{
    var enrollments = await _db.Enrollments
        .AsNoTracking()
        .Include(x => x.TrainingBatch)
        .Include(x => x.ParticipantProfile)
            .ThenInclude(x => x.User)
        .Where(x => x.Status == EnrollmentStatus.Approved)
        .OrderBy(x => x.TrainingBatch.BatchCode)
        .ThenBy(x => x.ParticipantProfile.User.FullName)
        .ToListAsync();

    var grades = new List<TrainingGradeDto>();

    foreach (var enrollment in enrollments)
    {
        var grade = await GetByEnrollmentAsync(enrollment.Id);

        if (grade is not null)
        {
            grades.Add(grade);
        }
    }

    return grades;
}
}
