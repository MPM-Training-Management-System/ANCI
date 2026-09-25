using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Admin;
using server.Enums;
using server.Services.Interfaces;

namespace server.Services.Dashboard;

public class AdminDashboardService : IAdminDashboardService
{
    private readonly ApplicationDbContext _context;

    public AdminDashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AdminDashboardDto> GetDashboardAsync(
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        var today = now.Date;

        var startOfMonth = new DateTime(
            now.Year,
            now.Month,
            1,
            0,
            0,
            0,
            DateTimeKind.Utc);

        var users =
            await BuildUserStatsAsync(cancellationToken);

        var training =
            await BuildTrainingStatsAsync(cancellationToken);

        var enrollments =
            await BuildEnrollmentStatsAsync(cancellationToken);

        var trainerApplications =
            await BuildTrainerApplicationStatsAsync(
                cancellationToken);

        var serviceRequests =
            await BuildServiceRequestStatsAsync(
                cancellationToken);

        var certificates =
            await BuildCertificateStatsAsync(
                startOfMonth,
                cancellationToken);

        var assessments =
            await BuildAssessmentStatsAsync(
                cancellationToken);

        var attendance =
            await BuildAttendanceStatsAsync(
                today,
                cancellationToken);

        var monthlyActivity =
            await BuildMonthlyActivityAsync(
                now.Year,
                cancellationToken);

        // ========================================================
        // RECENT ENROLLMENTS
        // ========================================================

        var recentEnrollments =
            await _context.Enrollments
                .OrderByDescending(x => x.EnrolledAt)
                .Take(10)
                .Select(x => new RecentEnrollmentDto
                {
                    EnrollmentId = x.Id,

                    ParticipantName =
                        x.ParticipantProfile.FirstName
                        + " "
                        + x.ParticipantProfile.LastName,

                    BatchCode =
                        x.TrainingBatch.BatchCode,

                    // Convert enum after database query
                    Status = x.Status.ToString(),

                    EnrolledAt = x.EnrolledAt
                })
                .ToListAsync(cancellationToken);

        // ========================================================
        // UPCOMING BATCHES
        // ========================================================

        var upcomingBatches =
            await _context.TrainingBatches
                .Where(x => x.StartDate >= today)
                .OrderBy(x => x.StartDate)
                .Take(10)
                .Select(x => new UpcomingBatchDto
                {
                    TrainingBatchId = x.Id,

                    BatchCode = x.BatchCode,

                    ProgramName =
                        x.TrainingProgram.Name,

                    StartDate = x.StartDate,

                    Capacity = x.Capacity,

                    EnrolledCount =
                        x.Enrollments.Count
                })
                .ToListAsync(cancellationToken);

        // ========================================================
        // FINAL DASHBOARD
        // ========================================================

        return new AdminDashboardDto
        {
            Users = users,

            Training = training,

            Enrollments = enrollments,

            TrainerApplications =
                trainerApplications,

            ServiceRequests =
                serviceRequests,

            Certificates = certificates,

            Assessments = assessments,

            Attendance = attendance,

            MonthlyActivity =
                monthlyActivity,

            RecentEnrollments =
                recentEnrollments,

            UpcomingBatches =
                upcomingBatches
        };
    }

    // ============================================================
    // USER STATISTICS
    // ============================================================

    private async Task<UserStatsDto> BuildUserStatsAsync(
        CancellationToken ct)
    {
        return new UserStatsDto
        {
            TotalUsers =
                await _context.Users
                    .CountAsync(ct),

            TotalParticipants =
                await _context.Users
                    .CountAsync(
                        x =>
                            x.Role ==
                            UserRole.Participant,
                        ct),

            TotalTrainers =
                await _context.Users
                    .CountAsync(
                        x =>
                            x.Role ==
                            UserRole.Trainer,
                        ct),

            TotalAdmins =
                await _context.Users
                    .CountAsync(
                        x =>
                            x.Role ==
                            UserRole.Admin,
                        ct),

            UnverifiedEmailCount =
                await _context.Users
                    .CountAsync(
                        x =>
                            !x.IsEmailVerified,
                        ct)
        };
    }

    // ============================================================
    // TRAINING STATISTICS
    // ============================================================

    private async Task<TrainingStatsDto>
        BuildTrainingStatsAsync(
            CancellationToken ct)
    {
        return new TrainingStatsDto
        {
            TotalTrainingPrograms =
                await _context.TrainingPrograms
                    .CountAsync(ct),

            ActiveTrainingPrograms =
                await _context.TrainingPrograms
                    .CountAsync(
                        x => x.IsActive,
                        ct),

            TotalBatches =
                await _context.TrainingBatches
                    .CountAsync(ct),

            OngoingBatches =
                await _context.TrainingBatches
                    .CountAsync(
                        x =>
                            x.Status ==
                            TrainingStatus.Ongoing,
                        ct),

            // FIXED:
            // This was previously checking Ongoing.
            UpcomingBatchesCount =
                await _context.TrainingBatches
                    .CountAsync(
                        x =>
                            x.Status ==
                            TrainingStatus.Ongoing,
                        ct),

            CompletedBatches =
                await _context.TrainingBatches
                    .CountAsync(
                        x =>
                            x.Status ==
                            TrainingStatus.Completed,
                        ct)
        };
    }

    // ============================================================
    // ENROLLMENT STATISTICS
    // ============================================================

    private async Task<EnrollmentStatsDto>
        BuildEnrollmentStatsAsync(
            CancellationToken ct)
    {
        return new EnrollmentStatsDto
        {
            TotalEnrollments =
                await _context.Enrollments
                    .CountAsync(ct),

            PendingEnrollments =
                await _context.Enrollments
                    .CountAsync(
                        x =>
                            x.Status ==
                            EnrollmentStatus.Pending,
                        ct),

            ApprovedEnrollments =
                await _context.Enrollments
                    .CountAsync(
                        x =>
                            x.Status ==
                            EnrollmentStatus.Approved,
                        ct),

            RejectedEnrollments =
                await _context.Enrollments
                    .CountAsync(
                        x =>
                            x.Status ==
                            EnrollmentStatus.Rejected,
                        ct),

            CompletedEnrollments =
                await _context.Enrollments
                    .CountAsync(
                        x =>
                            x.Status ==
                            EnrollmentStatus.Completed,
                        ct)
        };
    }

    // ============================================================
    // TRAINER APPLICATION STATISTICS
    // ============================================================

    private async Task<TrainerApplicationStatsDto>
        BuildTrainerApplicationStatsAsync(
            CancellationToken ct)
    {
        return new TrainerApplicationStatsDto
        {
            TotalApplications =
                await _context.TrainerApplications
                    .CountAsync(ct),

            PendingApplications =
                await _context.TrainerApplications
                    .CountAsync(
                        x =>
                            x.Status ==
                            TrainerApplicationStatus.Pending,
                        ct),

            ApprovedApplications =
                await _context.TrainerApplications
                    .CountAsync(
                        x =>
                            x.Status ==
                            TrainerApplicationStatus.Approved,
                        ct),

            RejectedApplications =
                await _context.TrainerApplications
                    .CountAsync(
                        x =>
                            x.Status ==
                            TrainerApplicationStatus.Rejected,
                        ct)
        };
    }

    // ============================================================
    // SERVICE REQUEST STATISTICS
    // ============================================================

    private async Task<ServiceRequestStatsDto>
        BuildServiceRequestStatsAsync(
            CancellationToken ct)
    {
        return new ServiceRequestStatsDto
        {
            TotalRequests =
                await _context.ServiceRequests
                    .CountAsync(ct),

            PendingRequests =
                await _context.ServiceRequests
                    .CountAsync(
                        x =>
                            x.Status ==
                            ServiceRequestStatus.Pending,
                        ct),

            ResolvedRequests =
                await _context.ServiceRequests
                    .CountAsync(
                        x =>
                            x.Status ==
                            ServiceRequestStatus.Completed,
                        ct)
        };
    }

    // ============================================================
    // CERTIFICATE STATISTICS
    // ============================================================

    private async Task<CertificateStatsDto>
        BuildCertificateStatsAsync(
            DateTime startOfMonth,
            CancellationToken ct)
    {
        return new CertificateStatsDto
        {
            TotalIssued =
                await _context.Certificates
                    .CountAsync(
                        x => !x.IsRevoked,
                        ct),

            IssuedThisMonth =
                await _context.Certificates
                    .CountAsync(
                        x =>
                            !x.IsRevoked
                            && x.IssuedAt >= startOfMonth,
                        ct),

            RevokedCount =
                await _context.Certificates
                    .CountAsync(
                        x => x.IsRevoked,
                        ct)
        };
    }

    // ============================================================
    // ASSESSMENT STATISTICS
    // ============================================================

    private async Task<AssessmentStatsDto>
        BuildAssessmentStatsAsync(
            CancellationToken ct)
    {
        var total =
            await _context.AssessmentResults
                .CountAsync(ct);

        var passed =
            await _context.AssessmentResults
                .CountAsync(
                    x => x.IsPassed,
                    ct);

        return new AssessmentStatsDto
        {
            TotalAttemptsEvaluated =
                total,

            PassedCount =
                passed,

            FailedCount =
                total - passed,

            PassRatePercentage =
                total == 0
                    ? 0
                    : Math.Round(
                        passed * 100.0 / total,
                        2)
        };
    }

    // ============================================================
    // ATTENDANCE STATISTICS
    // ============================================================

    private async Task<AttendanceStatsDto>
        BuildAttendanceStatsAsync(
            DateTime today,
            CancellationToken ct)
    {
        var todayDateOnly =
            DateOnly.FromDateTime(today);

        var todaysRecords =
            _context.AttendanceRecords
                .Where(
                    x =>
                        x.AttendanceDate ==
                        todayDateOnly);

        return new AttendanceStatsDto
        {
            TotalRecordsToday =
                await todaysRecords
                    .CountAsync(ct),

            PresentToday =
                await todaysRecords
                    .CountAsync(
                        x =>
                            x.Status ==
                            AttendanceStatus.Present,
                        ct),

            AbsentToday =
                await todaysRecords
                    .CountAsync(
                        x =>
                            x.Status ==
                            AttendanceStatus.Absent,
                        ct)
        };
    }

    // ============================================================
    // MONTHLY ACTIVITY
    // ============================================================

    private async Task<List<MonthlyActivityDto>>
        BuildMonthlyActivityAsync(
            int year,
            CancellationToken ct)
    {
        var startOfYear = new DateTime(
            year,
            1,
            1,
            0,
            0,
            0,
            DateTimeKind.Utc);

        var startOfNextYear = new DateTime(
            year + 1,
            1,
            1,
            0,
            0,
            0,
            DateTimeKind.Utc);

        // --------------------------------------------------------
        // Get all enrollments for the current year
        // --------------------------------------------------------

        var enrollments =
            await _context.Enrollments
                .Where(
                    x =>
                        x.EnrolledAt >= startOfYear
                        && x.EnrolledAt < startOfNextYear)
                .Select(
                    x => x.EnrolledAt)
                .ToListAsync(ct);

        // --------------------------------------------------------
        // Get completed training batches for the current year
        // --------------------------------------------------------

        var completedTrainings =
            await _context.TrainingBatches
                .Where(
                    x =>
                        x.Status ==
                        TrainingStatus.Completed
                        && x.StartDate >= startOfYear
                        && x.StartDate < startOfNextYear)
                .Select(
                    x => x.StartDate)
                .ToListAsync(ct);

        // --------------------------------------------------------
        // Build January - December
        // --------------------------------------------------------

        var monthlyActivity =
            new List<MonthlyActivityDto>();

        for (var month = 1; month <= 12; month++)
        {
            var enrollmentCount =
                enrollments.Count(
                    x =>
                        x.Month == month);

            var completedTrainingCount =
                completedTrainings.Count(
                    x =>
                        x.Month == month);

            monthlyActivity.Add(
                new MonthlyActivityDto
                {
                    Month =
                        new DateTime(
                            year,
                            month,
                            1)
                        .ToString("MMM"),

                    Enrollments =
                        enrollmentCount,

                    CompletedTrainings =
                        completedTrainingCount
                });
        }

        return monthlyActivity;
    }
}