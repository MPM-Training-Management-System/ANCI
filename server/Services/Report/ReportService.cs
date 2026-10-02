using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Reports;
using server.Enums;
using server.Interfaces.Reports;
using server.Models.Training;

namespace server.Services.Reports;

public class ReportService : IReportService
{
    private readonly ApplicationDbContext _context;

    public ReportService(ApplicationDbContext context)
    {
        _context = context;
    }

    // =========================================================
    // ADMIN OVERVIEW
    // =========================================================

    public async Task<AdminReportOverviewDto> GetAdminOverviewAsync()
    {
        var totalTrainingPrograms =
            await _context.TrainingPrograms.CountAsync();

        var activeTrainingPrograms =
            await _context.TrainingPrograms
                .CountAsync(x => x.IsActive);

        var totalTrainingBatches =
            await _context.TrainingBatches.CountAsync();

        var totalParticipants =
            await _context.ParticipantProfiles.CountAsync();

        var totalEnrollments =
            await _context.Enrollments.CountAsync();

        var activeEnrollments =
            await _context.Enrollments
                .CountAsync(x =>
                    x.Status == EnrollmentStatus.Approved);

        var totalTrainers =
            await _context.TrainerProfiles.CountAsync();

        var activeTrainerAssignments =
            await _context.TrainerAssignments
                .CountAsync(x => x.IsActive);

        var totalAttendanceRecords =
            await _context.AttendanceRecords.CountAsync();

        var presentAttendance =
            await _context.AttendanceRecords
                .CountAsync(x =>
                    x.Status == AttendanceStatus.Present);

        var absentAttendance =
            await _context.AttendanceRecords
                .CountAsync(x =>
                    x.Status == AttendanceStatus.Absent);

        var lateAttendance =
            await _context.AttendanceRecords
                .CountAsync(x =>
                    x.Status == AttendanceStatus.Late);

        var attendanceRate =
            totalAttendanceRecords == 0
                ? 0
                : Math.Round(
                    presentAttendance * 100m /
                    totalAttendanceRecords,
                    2);

        var totalWrittenAssessments =
            await _context.WrittenAssessments.CountAsync();

        var publishedWrittenAssessments =
            await _context.WrittenAssessments
                .CountAsync(x => x.IsPublished);

        var totalAssessmentAttempts =
            await _context.AssessmentAttempts.CountAsync();

        var totalCertificates =
            await _context.Certificates.CountAsync();

        var completionCertificates =
            await _context.Certificates
                .CountAsync(x =>
                    x.Type == CertificateType.Completion);

        var participationCertificates =
            await _context.Certificates
                .CountAsync(x =>
                    x.Type == CertificateType.Participation);

        var revokedCertificates =
            await _context.Certificates
                .CountAsync(x => x.IsRevoked);

        var totalServices =
            await _context.Services.CountAsync();

        var activeServices =
            await _context.Services
                .CountAsync(x => x.IsActive);

        var totalServiceRequests =
            await _context.ServiceRequests.CountAsync();

        return new AdminReportOverviewDto
        {
            TotalTrainingPrograms =
                totalTrainingPrograms,

            ActiveTrainingPrograms =
                activeTrainingPrograms,

            TotalTrainingBatches =
                totalTrainingBatches,

            TotalParticipants =
                totalParticipants,

            TotalEnrollments =
                totalEnrollments,

            ActiveEnrollments =
                activeEnrollments,

            TotalTrainers =
                totalTrainers,

            ActiveTrainerAssignments =
                activeTrainerAssignments,

            TotalAttendanceRecords =
                totalAttendanceRecords,

            PresentAttendance =
                presentAttendance,

            AbsentAttendance =
                absentAttendance,

            LateAttendance =
                lateAttendance,

            AttendanceRate =
                attendanceRate,

            TotalWrittenAssessments =
                totalWrittenAssessments,

            PublishedWrittenAssessments =
                publishedWrittenAssessments,

            TotalAssessmentAttempts =
                totalAssessmentAttempts,

            TotalCertificates =
                totalCertificates,

            CompletionCertificates =
                completionCertificates,

            ParticipationCertificates =
                participationCertificates,

            RevokedCertificates =
                revokedCertificates,

            TotalServices =
                totalServices,

            ActiveServices =
                activeServices,

            TotalServiceRequests =
                totalServiceRequests
        };
    }

    // =========================================================
    // TRAINING COMPLETION REPORT
    // =========================================================

    public async Task<TrainingCompletionReportDto>
        GetTrainingCompletionReportAsync(
            ReportFilterDto filter)
    {
        var dateFrom = ToUtc(filter.DateFrom);
        var dateTo = ToUtc(filter.DateTo);

        var query = _context.Enrollments
            .AsNoTracking()
            .Include(x => x.ParticipantProfile)
                .ThenInclude(x => x.User)
            .Include(x => x.TrainingBatch)
                .ThenInclude(x => x.TrainingProgram)
            .Include(x => x.TrainingBatch)
                .ThenInclude(x => x.TrainerAssignments)
                    .ThenInclude(x => x.TrainerProfile)
                        .ThenInclude(x => x.User)
            .AsQueryable();

        // -----------------------------------------------------
        // TRAINING PROGRAM
        // -----------------------------------------------------

        if (filter.TrainingProgramId.HasValue)
        {
            query = query.Where(x =>
                x.TrainingBatch.TrainingProgramId ==
                filter.TrainingProgramId.Value);
        }

        // -----------------------------------------------------
        // TRAINING BATCH
        // -----------------------------------------------------

        if (filter.TrainingBatchId.HasValue)
        {
            query = query.Where(x =>
                x.TrainingBatchId ==
                filter.TrainingBatchId.Value);
        }

        // -----------------------------------------------------
        // TRAINER
        // -----------------------------------------------------

        if (filter.TrainerProfileId.HasValue)
        {
            query = query.Where(x =>
                x.TrainingBatch.TrainerAssignments
                    .Any(a =>
                        a.TrainerProfileId ==
                        filter.TrainerProfileId.Value &&
                        a.IsActive));
        }

        // -----------------------------------------------------
        // DATE FROM
        // -----------------------------------------------------

        if (dateFrom.HasValue)
        {
            query = query.Where(x =>
                x.TrainingBatch.StartDate >=
                dateFrom.Value);
        }

        // -----------------------------------------------------
        // DATE TO
        // Inclusive full day
        // -----------------------------------------------------

        if (dateTo.HasValue)
        {
            var exclusiveDateTo =
                dateTo.Value.Date.AddDays(1);

            query = query.Where(x =>
                x.TrainingBatch.EndDate <
                exclusiveDateTo);
        }

        // -----------------------------------------------------
        // STATUS
        // IMPORTANT:
        // Never use enum.ToString() inside IQueryable.
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status =
                filter.Status.Trim();

            if (Enum.TryParse<EnrollmentStatus>(
                status,
                true,
                out var enrollmentStatus))
            {
                query = query.Where(x =>
                    x.Status == enrollmentStatus);
            }
        }

        // -----------------------------------------------------
        // SEARCH
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search =
                filter.Search.Trim();

            query = query.Where(x =>
                (
                    x.ParticipantProfile.FirstName != null &&
                    x.ParticipantProfile.FirstName
                        .Contains(search)
                )
                ||
                (
                    x.ParticipantProfile.LastName != null &&
                    x.ParticipantProfile.LastName
                        .Contains(search)
                )
                ||
                x.ParticipantProfile.User.Email
                    .Contains(search)
                ||
                x.ParticipantProfile.User.UserCode
                    .Contains(search)
                ||
                x.TrainingBatch.BatchCode
                    .Contains(search)
                ||
                x.TrainingBatch.TrainingProgram.Name
                    .Contains(search)
            );
        }

        // -----------------------------------------------------
        // TOTAL PARTICIPANTS
        // -----------------------------------------------------

        var totalParticipants =
            await query.CountAsync();

        // -----------------------------------------------------
        // LOAD ENROLLMENTS
        // -----------------------------------------------------

        var rawItems =
            await query
                .OrderByDescending(x =>
                    x.EnrolledAt)
                .ToListAsync();

        var completionItems =
            new List<TrainingCompletionReportItemDto>();

        foreach (var enrollment in rawItems)
        {
            var participant =
                enrollment.ParticipantProfile;

            var user =
                participant.User;

            var batch =
                enrollment.TrainingBatch;

            var program =
                batch.TrainingProgram;

            // -------------------------------------------------
            // TRAINER
            // -------------------------------------------------

            var trainerAssignment =
                batch.TrainerAssignments
                    .FirstOrDefault(x =>
                        x.IsActive);

            string? trainerName = null;

            if (trainerAssignment?.TrainerProfile != null)
            {
                trainerName =
                    trainerAssignment
                        .TrainerProfile
                        .User
                        .FullName;
            }

            // -------------------------------------------------
            // ATTENDANCE
            // -------------------------------------------------

            var attendanceRecords =
                await _context.AttendanceRecords
                    .AsNoTracking()
                    .Where(x =>
                        x.EnrollmentId ==
                        enrollment.Id)
                    .ToListAsync();

            var attendanceRate = 0m;

            if (attendanceRecords.Count > 0)
            {
                var presentCount =
                    attendanceRecords.Count(x =>
                        x.Status ==
                        AttendanceStatus.Present);

                attendanceRate =
                    Math.Round(
                        presentCount * 100m /
                        attendanceRecords.Count,
                        2);
            }

            // -------------------------------------------------
            // ASSESSMENT
            // -------------------------------------------------

            var latestAttempt =
                await _context.AssessmentAttempts
                    .AsNoTracking()
                    .Include(x => x.Result)
                    .Where(x =>
                        x.EnrollmentId ==
                        enrollment.Id &&
                        x.Result != null)
                    .OrderByDescending(x =>
                        x.AttemptNumber)
                    .FirstOrDefaultAsync();

            decimal? assessmentScore = null;

            var assessmentStatus =
                "Not Taken";

            DateTime? completedAt = null;

            if (latestAttempt?.Result != null)
            {
                assessmentScore =
                    latestAttempt.Result.Percentage;

                assessmentStatus =
                    latestAttempt.Result.IsPassed
                        ? "Passed"
                        : "Failed";

                if (latestAttempt.Result.IsPassed)
                {
                    completedAt =
                        latestAttempt.Result.EvaluatedAt;
                }
            }

            // -------------------------------------------------
            // CERTIFICATE
            // -------------------------------------------------

            var certificate =
                await _context.Certificates
                    .AsNoTracking()
                    .Where(x =>
                        x.EnrollmentId ==
                        enrollment.Id &&
                        !x.IsRevoked)
                    .OrderByDescending(x =>
                        x.IssuedAt)
                    .FirstOrDefaultAsync();

            var hasCertificate =
                certificate != null;

            // -------------------------------------------------
            // COMPLETION
            // -------------------------------------------------

            var isAttendanceComplete =
                attendanceRecords.Count > 0 &&
                attendanceRecords.All(x =>
                    x.Status ==
                    AttendanceStatus.Present);

            var isAssessmentComplete =
                latestAttempt?.Result?.IsPassed ==
                true;

            var isCompleted =
                isAttendanceComplete &&
                isAssessmentComplete;

            var completionStatus =
                isCompleted
                    ? "Completed"
                    : "Incomplete";

            if (isCompleted &&
                completedAt == null)
            {
                completedAt =
                    certificate?.IssuedAt;
            }

            // -------------------------------------------------
            // PARTICIPANT NAME
            // -------------------------------------------------

            var participantName =
                string.Join(
                    " ",
                    new[]
                    {
                        participant.FirstName,
                        participant.MiddleName,
                        participant.LastName
                    }
                    .Where(x =>
                        !string.IsNullOrWhiteSpace(x)))
                .Trim();

            if (string.IsNullOrWhiteSpace(
                participantName))
            {
                participantName =
                    user.FullName;
            }

            // -------------------------------------------------
            // ADD ITEM
            // -------------------------------------------------

            completionItems.Add(
                new TrainingCompletionReportItemDto
                {
                    ParticipantId =
                        participant.Id,

                    ParticipantName =
                        participantName,

                    ParticipantCode =
                        user.UserCode,

                    TrainingProgramName =
                        program.Name,

                    BatchCode =
                        batch.BatchCode,

                    TrainingBatchId =
                        batch.Id,

                    TrainerName =
                        trainerName,

                    TrainingStartDate =
                        batch.StartDate,

                    TrainingEndDate =
                        batch.EndDate,

                    AttendanceRate =
                        attendanceRate,

                    AssessmentScore =
                        assessmentScore,

                    AssessmentStatus =
                        assessmentStatus,

                    CompletionStatus =
                        completionStatus,

                    CompletedAt =
                        completedAt,

                    CertificateNumber =
                        certificate?.CertificateNumber,

                    HasCertificate =
                        hasCertificate
                });
        }

        // -----------------------------------------------------
        // SUMMARY
        // -----------------------------------------------------

        var completedParticipants =
            completionItems.Count(x =>
                x.CompletionStatus ==
                "Completed");

        var incompleteParticipants =
            completionItems.Count(x =>
                x.CompletionStatus ==
                "Incomplete");

        var completionRate =
            totalParticipants == 0
                ? 0
                : Math.Round(
                    completedParticipants * 100m /
                    totalParticipants,
                    2);

        // -----------------------------------------------------
        // PAGINATION
        // -----------------------------------------------------

        var page =
            NormalizePage(filter.Page);

        var pageSize =
            NormalizePageSize(filter.PageSize);

        var totalCount =
            completionItems.Count;

        var totalPages =
            CalculateTotalPages(
                totalCount,
                pageSize);

        var pagedItems =
            completionItems
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

        return new TrainingCompletionReportDto
        {
            TotalParticipants =
                totalParticipants,

            CompletedParticipants =
                completedParticipants,

            IncompleteParticipants =
                incompleteParticipants,

            CompletionRate =
                completionRate,

            Results =
                new PagedReportResultDto
                    <TrainingCompletionReportItemDto>
                {
                    Items =
                        pagedItems,

                    Page =
                        page,

                    PageSize =
                        pageSize,

                    TotalCount =
                        totalCount,

                    TotalPages =
                        totalPages
                }
        };
    }

    // =========================================================
    // ENROLLMENT REPORT
    // =========================================================

    public async Task<EnrollmentReportDto>
        GetEnrollmentReportAsync(
            ReportFilterDto filter)
    {
        var dateFrom =
            ToUtc(filter.DateFrom);

        var dateTo =
            ToUtc(filter.DateTo);

        var query = _context.Enrollments
            .AsNoTracking()
            .Include(x => x.ParticipantProfile)
                .ThenInclude(x => x.User)
            .Include(x => x.TrainingBatch)
                .ThenInclude(x => x.TrainingProgram)
            .Include(x => x.TrainingBatch)
                .ThenInclude(x => x.TrainerAssignments)
                    .ThenInclude(x => x.TrainerProfile)
                        .ThenInclude(x => x.User)
            .AsQueryable();

        // -----------------------------------------------------
        // TRAINING PROGRAM
        // -----------------------------------------------------

        if (filter.TrainingProgramId.HasValue)
        {
            query = query.Where(x =>
                x.TrainingBatch.TrainingProgramId ==
                filter.TrainingProgramId.Value);
        }

        // -----------------------------------------------------
        // TRAINING BATCH
        // -----------------------------------------------------

        if (filter.TrainingBatchId.HasValue)
        {
            query = query.Where(x =>
                x.TrainingBatchId ==
                filter.TrainingBatchId.Value);
        }

        // -----------------------------------------------------
        // TRAINER
        // -----------------------------------------------------

        if (filter.TrainerProfileId.HasValue)
        {
            query = query.Where(x =>
                x.TrainingBatch.TrainerAssignments
                    .Any(a =>
                        a.TrainerProfileId ==
                        filter.TrainerProfileId.Value &&
                        a.IsActive));
        }

        // -----------------------------------------------------
        // DATE FROM
        // -----------------------------------------------------

        if (dateFrom.HasValue)
        {
            query = query.Where(x =>
                x.EnrolledAt >=
                dateFrom.Value);
        }

        // -----------------------------------------------------
        // DATE TO
        // Inclusive full day
        // -----------------------------------------------------

        if (dateTo.HasValue)
        {
            var exclusiveDateTo =
                dateTo.Value.Date.AddDays(1);

            query = query.Where(x =>
                x.EnrolledAt <
                exclusiveDateTo);
        }

        // -----------------------------------------------------
        // STATUS
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status =
                filter.Status.Trim();

            if (Enum.TryParse<EnrollmentStatus>(
                status,
                true,
                out var enrollmentStatus))
            {
                query = query.Where(x =>
                    x.Status == enrollmentStatus);
            }
        }

        // -----------------------------------------------------
        // SEARCH
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search =
                filter.Search.Trim();

            query = query.Where(x =>
                (
                    x.ParticipantProfile.FirstName != null &&
                    x.ParticipantProfile.FirstName
                        .Contains(search)
                )
                ||
                (
                    x.ParticipantProfile.LastName != null &&
                    x.ParticipantProfile.LastName
                        .Contains(search)
                )
                ||
                x.ParticipantProfile.User.Email
                    .Contains(search)
                ||
                x.ParticipantProfile.User.UserCode
                    .Contains(search)
                ||
                x.TrainingBatch.BatchCode
                    .Contains(search)
                ||
                x.TrainingBatch.TrainingProgram.Name
                    .Contains(search)
            );
        }

        // -----------------------------------------------------
        // SUMMARY
        // -----------------------------------------------------

        var totalEnrollments =
            await query.CountAsync();

        var approvedEnrollments =
            await query.CountAsync(x =>
                x.Status ==
                EnrollmentStatus.Approved);

        var pendingEnrollments =
            await query.CountAsync(x =>
                x.Status ==
                EnrollmentStatus.Pending);

        var rejectedEnrollments =
            await query.CountAsync(x =>
                x.Status ==
                EnrollmentStatus.Rejected);

        // -----------------------------------------------------
        // DATA
        // -----------------------------------------------------

        var enrollments =
            await query
                .OrderByDescending(x =>
                    x.EnrolledAt)
                .ToListAsync();

        var items =
            new List<EnrollmentReportItemDto>();

        foreach (var enrollment in enrollments)
        {
            var participant =
                enrollment.ParticipantProfile;

            var batch =
                enrollment.TrainingBatch;

            var program =
                batch.TrainingProgram;

            var trainerAssignment =
                batch.TrainerAssignments
                    .FirstOrDefault(x =>
                        x.IsActive);

            string? trainerName = null;

            if (trainerAssignment?.TrainerProfile != null)
            {
                trainerName =
                    trainerAssignment
                        .TrainerProfile
                        .User
                        .FullName;
            }

            var participantName =
                string.Join(
                    " ",
                    new[]
                    {
                        participant.FirstName,
                        participant.MiddleName,
                        participant.LastName
                    }
                    .Where(x =>
                        !string.IsNullOrWhiteSpace(x)))
                .Trim();

            if (string.IsNullOrWhiteSpace(
                participantName))
            {
                participantName =
                    participant.User.FullName;
            }

            items.Add(
                new EnrollmentReportItemDto
                {
                    EnrollmentId =
                        enrollment.Id,

                    ParticipantId =
                        participant.Id,

                    ParticipantCode =
                        participant.User.UserCode,

                    ParticipantName =
                        participantName,

                    ParticipantEmail =
                        participant.User.Email,

                    TrainingProgramName =
                        program.Name,

                    TrainingBatchId =
                        batch.Id,

                    BatchCode =
                        batch.BatchCode,

                    TrainerName =
                        trainerName,

                    EnrollmentStatus =
                        enrollment.Status.ToString(),

                    EnrolledAt =
                        enrollment.EnrolledAt,

                    ApprovedAt =
                        enrollment.ApprovedAt,

                    ReviewRemarks =
                        enrollment.ReviewRemarks
                });
        }

        // -----------------------------------------------------
        // PAGINATION
        // -----------------------------------------------------

        var page =
            NormalizePage(filter.Page);

        var pageSize =
            NormalizePageSize(filter.PageSize);

        var totalCount =
            items.Count;

        var totalPages =
            CalculateTotalPages(
                totalCount,
                pageSize);

        var pagedItems =
            items
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

        return new EnrollmentReportDto
        {
            TotalEnrollments =
                totalEnrollments,

            ApprovedEnrollments =
                approvedEnrollments,

            PendingEnrollments =
                pendingEnrollments,

            RejectedEnrollments =
                rejectedEnrollments,

            Results =
                new PagedReportResultDto
                    <EnrollmentReportItemDto>
                {
                    Items =
                        pagedItems,

                    Page =
                        page,

                    PageSize =
                        pageSize,

                    TotalCount =
                        totalCount,

                    TotalPages =
                        totalPages
                }
        };
    }

    // =========================================================
    // ATTENDANCE REPORT
    // =========================================================

    public async Task<AttendanceReportDto>
        GetAttendanceReportAsync(
            ReportFilterDto filter)
    {
        var query = _context.AttendanceRecords
            .AsNoTracking()
            .Include(x => x.Enrollment)
                .ThenInclude(x =>
                    x.ParticipantProfile)
                    .ThenInclude(x =>
                        x.User)
            .Include(x => x.Enrollment)
                .ThenInclude(x =>
                    x.TrainingBatch)
                    .ThenInclude(x =>
                        x.TrainingProgram)
            .Include(x => x.Enrollment)
                .ThenInclude(x =>
                    x.TrainingBatch)
                    .ThenInclude(x =>
                        x.TrainerAssignments)
                        .ThenInclude(x =>
                            x.TrainerProfile)
                            .ThenInclude(x =>
                                x.User)
            .AsQueryable();

        // -----------------------------------------------------
        // TRAINING PROGRAM
        // -----------------------------------------------------

        if (filter.TrainingProgramId.HasValue)
        {
            query = query.Where(x =>
                x.Enrollment.TrainingBatch
                    .TrainingProgramId ==
                filter.TrainingProgramId.Value);
        }

        // -----------------------------------------------------
        // TRAINING BATCH
        // -----------------------------------------------------

        if (filter.TrainingBatchId.HasValue)
        {
            query = query.Where(x =>
                x.Enrollment.TrainingBatchId ==
                filter.TrainingBatchId.Value);
        }

        // -----------------------------------------------------
        // TRAINER
        // -----------------------------------------------------

        if (filter.TrainerProfileId.HasValue)
        {
            query = query.Where(x =>
                x.Enrollment.TrainingBatch
                    .TrainerAssignments
                    .Any(a =>
                        a.TrainerProfileId ==
                        filter.TrainerProfileId.Value &&
                        a.IsActive));
        }

        // -----------------------------------------------------
        // DATE FROM
        // AttendanceDate is DateOnly.
        // -----------------------------------------------------

        if (filter.DateFrom.HasValue)
        {
            var dateFrom =
                DateOnly.FromDateTime(
                    filter.DateFrom.Value);

            query = query.Where(x =>
                x.AttendanceDate >=
                dateFrom);
        }

        // -----------------------------------------------------
        // DATE TO
        // -----------------------------------------------------

        if (filter.DateTo.HasValue)
        {
            var dateTo =
                DateOnly.FromDateTime(
                    filter.DateTo.Value);

            query = query.Where(x =>
                x.AttendanceDate <=
                dateTo);
        }

        // -----------------------------------------------------
        // STATUS
        // IMPORTANT:
        // Parse enum OUTSIDE IQueryable.
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status =
                filter.Status.Trim();

            if (Enum.TryParse<AttendanceStatus>(
                status,
                true,
                out var attendanceStatus))
            {
                query = query.Where(x =>
                    x.Status == attendanceStatus);
            }
        }

        // -----------------------------------------------------
        // SEARCH
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search =
                filter.Search.Trim();

            query = query.Where(x =>
                (
                    x.Enrollment
                        .ParticipantProfile
                        .FirstName != null &&
                    x.Enrollment
                        .ParticipantProfile
                        .FirstName
                        .Contains(search)
                )
                ||
                (
                    x.Enrollment
                        .ParticipantProfile
                        .LastName != null &&
                    x.Enrollment
                        .ParticipantProfile
                        .LastName
                        .Contains(search)
                )
                ||
                x.Enrollment
                    .ParticipantProfile
                    .User
                    .Email
                    .Contains(search)
                ||
                x.Enrollment
                    .ParticipantProfile
                    .User
                    .UserCode
                    .Contains(search)
                ||
                x.Enrollment
                    .TrainingBatch
                    .BatchCode
                    .Contains(search)
                ||
                x.Enrollment
                    .TrainingBatch
                    .TrainingProgram
                    .Name
                    .Contains(search)
            );
        }

        // -----------------------------------------------------
        // SUMMARY
        // -----------------------------------------------------

        var totalRecords =
            await query.CountAsync();

        var presentRecords =
            await query.CountAsync(x =>
                x.Status ==
                AttendanceStatus.Present);

        var absentRecords =
            await query.CountAsync(x =>
                x.Status ==
                AttendanceStatus.Absent);

        var lateRecords =
            await query.CountAsync(x =>
                x.Status ==
                AttendanceStatus.Late);

        var attendanceRate =
            totalRecords == 0
                ? 0
                : Math.Round(
                    presentRecords * 100m /
                    totalRecords,
                    2);

        // -----------------------------------------------------
        // DATA
        // -----------------------------------------------------

        var records =
            await query
                .OrderByDescending(x =>
                    x.AttendanceDate)
                .ThenByDescending(x =>
                    x.TimeIn)
                .ToListAsync();

        var items =
            new List<AttendanceReportItemDto>();

        foreach (var record in records)
        {
            var enrollment =
                record.Enrollment;

            var participant =
                enrollment.ParticipantProfile;

            var batch =
                enrollment.TrainingBatch;

            var program =
                batch.TrainingProgram;

            var trainerAssignment =
                batch.TrainerAssignments
                    .FirstOrDefault(x =>
                        x.IsActive);

            string? trainerName = null;

            if (trainerAssignment?.TrainerProfile != null)
            {
                trainerName =
                    trainerAssignment
                        .TrainerProfile
                        .User
                        .FullName;
            }

            var participantName =
                string.Join(
                    " ",
                    new[]
                    {
                        participant.FirstName,
                        participant.MiddleName,
                        participant.LastName
                    }
                    .Where(x =>
                        !string.IsNullOrWhiteSpace(x)))
                .Trim();

            if (string.IsNullOrWhiteSpace(
                participantName))
            {
                participantName =
                    participant.User.FullName;
            }

            items.Add(
                new AttendanceReportItemDto
                {
                    AttendanceRecordId =
                        record.Id,

                    EnrollmentId =
                        enrollment.Id,

                    ParticipantId =
                        participant.Id,

                    ParticipantCode =
                        participant.User.UserCode,

                    ParticipantName =
                        participantName,

                    ParticipantEmail =
                        participant.User.Email,

                    TrainingProgramName =
                        program.Name,

                    TrainingBatchId =
                        batch.Id,

                    BatchCode =
                        batch.BatchCode,

                    TrainerName =
                        trainerName,

                    AttendanceDate =
                        record.AttendanceDate,

                    TimeIn =
                        record.TimeIn,

                    TimeOut =
                        record.TimeOut,

                    AttendanceStatus =
                        record.Status.ToString(),

                    AttendanceMethod =
                        record.Method ??
                        "Manual"
                });
        }

        // -----------------------------------------------------
        // PAGINATION
        // -----------------------------------------------------

        var page =
            NormalizePage(filter.Page);

        var pageSize =
            NormalizePageSize(filter.PageSize);

        var totalCount =
            items.Count;

        var totalPages =
            CalculateTotalPages(
                totalCount,
                pageSize);

        var pagedItems =
            items
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

        return new AttendanceReportDto
        {
            TotalRecords =
                totalRecords,

            PresentRecords =
                presentRecords,

            AbsentRecords =
                absentRecords,

            LateRecords =
                lateRecords,

            AttendanceRate =
                attendanceRate,

            Results =
                new PagedReportResultDto
                    <AttendanceReportItemDto>
                {
                    Items =
                        pagedItems,

                    Page =
                        page,

                    PageSize =
                        pageSize,

                    TotalCount =
                        totalCount,

                    TotalPages =
                        totalPages
                }
        };
    }

    // =========================================================
    // ASSESSMENT RESULTS REPORT
    // =========================================================

    public async Task<AssessmentResultsReportDto>
        GetAssessmentResultsReportAsync(
            ReportFilterDto filter)
    {
        var dateFrom =
            ToUtc(filter.DateFrom);

        var dateTo =
            ToUtc(filter.DateTo);

        var query = _context.AssessmentAttempts
            .AsNoTracking()

            // Assessment
            .Include(x => x.WrittenAssessment)
                .ThenInclude(x =>
                    x.Questions)

            .Include(x => x.WrittenAssessment)
                .ThenInclude(x =>
                    x.TrainingBatch)
                    .ThenInclude(x =>
                        x.TrainingProgram)

            .Include(x => x.WrittenAssessment)
                .ThenInclude(x =>
                    x.TrainingBatch)
                    .ThenInclude(x =>
                        x.TrainerAssignments)
                        .ThenInclude(x =>
                            x.TrainerProfile)
                            .ThenInclude(x =>
                                x.User)

            // Enrollment
            .Include(x => x.Enrollment)
                .ThenInclude(x =>
                    x.ParticipantProfile)
                    .ThenInclude(x =>
                        x.User)

            // Answers
            .Include(x => x.Answers)

            // Result
            .Include(x => x.Result)

            .AsQueryable();

        // -----------------------------------------------------
        // TRAINING PROGRAM
        // -----------------------------------------------------

        if (filter.TrainingProgramId.HasValue)
        {
            query = query.Where(x =>
                x.WrittenAssessment
                    .TrainingBatch
                    .TrainingProgramId ==
                filter.TrainingProgramId.Value);
        }

        // -----------------------------------------------------
        // TRAINING BATCH
        // -----------------------------------------------------

        if (filter.TrainingBatchId.HasValue)
        {
            query = query.Where(x =>
                x.WrittenAssessment
                    .TrainingBatchId ==
                filter.TrainingBatchId.Value);
        }

        // -----------------------------------------------------
        // TRAINER
        // -----------------------------------------------------

        if (filter.TrainerProfileId.HasValue)
        {
            query = query.Where(x =>
                x.WrittenAssessment
                    .TrainingBatch
                    .TrainerAssignments
                    .Any(a =>
                        a.TrainerProfileId ==
                        filter.TrainerProfileId.Value &&
                        a.IsActive));
        }

        // -----------------------------------------------------
        // DATE FROM
        // Uses SubmittedAt
        // -----------------------------------------------------

        if (dateFrom.HasValue)
        {
            query = query.Where(x =>
                x.SubmittedAt.HasValue &&
                x.SubmittedAt.Value >=
                dateFrom.Value);
        }

        // -----------------------------------------------------
        // DATE TO
        // Inclusive full day
        // -----------------------------------------------------

        if (dateTo.HasValue)
        {
            var exclusiveDateTo =
                dateTo.Value.Date.AddDays(1);

            query = query.Where(x =>
                x.SubmittedAt.HasValue &&
                x.SubmittedAt.Value <
                exclusiveDateTo);
        }

        // -----------------------------------------------------
        // STATUS
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status =
                filter.Status.Trim();

            if (Enum.TryParse<AssessmentAttemptStatus>(
                status,
                true,
                out var assessmentStatus))
            {
                query = query.Where(x =>
                    x.Status == assessmentStatus);
            }
        }

        // -----------------------------------------------------
        // SEARCH
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search =
                filter.Search.Trim();

            query = query.Where(x =>
                (
                    x.Enrollment
                        .ParticipantProfile
                        .FirstName != null &&
                    x.Enrollment
                        .ParticipantProfile
                        .FirstName
                        .Contains(search)
                )
                ||
                (
                    x.Enrollment
                        .ParticipantProfile
                        .LastName != null &&
                    x.Enrollment
                        .ParticipantProfile
                        .LastName
                        .Contains(search)
                )
                ||
                x.Enrollment
                    .ParticipantProfile
                    .User
                    .Email
                    .Contains(search)
                ||
                x.Enrollment
                    .ParticipantProfile
                    .User
                    .UserCode
                    .Contains(search)
                ||
                x.WrittenAssessment
                    .Title
                    .Contains(search)
                ||
                x.WrittenAssessment
                    .TrainingBatch
                    .BatchCode
                    .Contains(search)
                ||
                x.WrittenAssessment
                    .TrainingBatch
                    .TrainingProgram
                    .Name
                    .Contains(search)
            );
        }

        // -----------------------------------------------------
        // LOAD ATTEMPTS
        // -----------------------------------------------------

        var attempts =
            await query
                .OrderByDescending(x =>
                    x.SubmittedAt ??
                    x.StartedAt)
                .ThenByDescending(x =>
                    x.AttemptNumber)
                .ToListAsync();

        // -----------------------------------------------------
        // SUMMARY
        // -----------------------------------------------------

        var totalAttempts =
            attempts.Count;

        var evaluatedAttempts =
            attempts
                .Where(x =>
                    x.Result != null)
                .ToList();

        var passedAttempts =
            evaluatedAttempts.Count(x =>
                x.Result!.IsPassed);

        var failedAttempts =
            evaluatedAttempts.Count(x =>
                !x.Result!.IsPassed);

        var pendingAttempts =
            attempts.Count(x =>
                x.Result == null);

        var averageScore =
            evaluatedAttempts.Count == 0
                ? 0
                : Math.Round(
                    evaluatedAttempts
                        .Average(x =>
                            x.Result!.Percentage),
                    2);

        var passRate =
            evaluatedAttempts.Count == 0
                ? 0
                : Math.Round(
                    passedAttempts * 100m /
                    evaluatedAttempts.Count,
                    2);

        // -----------------------------------------------------
        // ITEMS
        // -----------------------------------------------------

        var items =
            new List<AssessmentResultsReportItemDto>();

        foreach (var attempt in attempts)
        {
            var assessment =
                attempt.WrittenAssessment;

            var batch =
                assessment.TrainingBatch;

            var program =
                batch.TrainingProgram;

            var participant =
                attempt.Enrollment
                    .ParticipantProfile;

            var user =
                participant.User;

            // -------------------------------------------------
            // PARTICIPANT NAME
            // -------------------------------------------------

            var participantName =
                string.Join(
                    " ",
                    new[]
                    {
                        participant.FirstName,
                        participant.MiddleName,
                        participant.LastName
                    }
                    .Where(x =>
                        !string.IsNullOrWhiteSpace(x)))
                .Trim();

            if (string.IsNullOrWhiteSpace(
                participantName))
            {
                participantName =
                    user.FullName;
            }

            // -------------------------------------------------
            // TRAINER
            // -------------------------------------------------

            var trainerAssignment =
                batch.TrainerAssignments
                    .FirstOrDefault(x =>
                        x.IsActive);

            string? trainerName = null;

            if (trainerAssignment?.TrainerProfile != null)
            {
                trainerName =
                    trainerAssignment
                        .TrainerProfile
                        .User
                        .FullName;
            }

            // -------------------------------------------------
            // RESULT
            // -------------------------------------------------

            var result =
                attempt.Result;

            var totalQuestions =
                result?.TotalQuestions
                ?? assessment.Questions.Count;

            var correctAnswers =
                result?.CorrectAnswers
                ?? attempt.Answers.Count(x =>
                    x.IsCorrect);

            var totalPoints =
                result?.TotalPoints
                ?? assessment.Questions.Sum(x =>
                    x.Points);

            var earnedPoints =
                result?.EarnedPoints
                ?? attempt.Answers.Sum(x =>
                    x.EarnedPoints);

            var percentage =
                result?.Percentage
                ??
                (
                    totalPoints == 0
                        ? 0
                        : Math.Round(
                            earnedPoints * 100m /
                            totalPoints,
                            2)
                );

            var isPassed =
                result?.IsPassed ??
                (
                    percentage >=
                    assessment.PassingPercentage
                );

            // -------------------------------------------------
            // STATUS
            // -------------------------------------------------

            var assessmentStatus =
                result == null
                    ? "Pending"
                    : isPassed
                        ? "Passed"
                        : "Failed";

            // -------------------------------------------------
            // ADD ITEM
            // -------------------------------------------------

            items.Add(
                new AssessmentResultsReportItemDto
                {
                    AssessmentAttemptId =
                        attempt.Id,

                    AssessmentId =
                        assessment.Id,

                    AssessmentTitle =
                        assessment.Title,

                    EnrollmentId =
                        attempt.EnrollmentId,

                    ParticipantId =
                        participant.Id,

                    ParticipantCode =
                        user.UserCode,

                    ParticipantName =
                        participantName,

                    ParticipantEmail =
                        user.Email,

                    TrainingProgramName =
                        program.Name,

                    TrainingBatchId =
                        batch.Id,

                    BatchCode =
                        batch.BatchCode,

                    TrainerName =
                        trainerName,

                    AttemptNumber =
                        attempt.AttemptNumber,

                    TotalQuestions =
                        totalQuestions,

                    CorrectAnswers =
                        correctAnswers,

                    TotalPoints =
                        totalPoints,

                    EarnedPoints =
                        earnedPoints,

                    Percentage =
                        percentage,

                    IsPassed =
                        isPassed,

                    AssessmentStatus =
                        assessmentStatus,

                    StartedAt =
                        attempt.StartedAt,

                    SubmittedAt =
                        attempt.SubmittedAt,

                    EvaluatedAt =
                        result?.EvaluatedAt
                });
        }

        // -----------------------------------------------------
        // PAGINATION
        // -----------------------------------------------------

        var page =
            NormalizePage(filter.Page);

        var pageSize =
            NormalizePageSize(filter.PageSize);

        var totalCount =
            items.Count;

        var totalPages =
            CalculateTotalPages(
                totalCount,
                pageSize);

        var pagedItems =
            items
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

        return new AssessmentResultsReportDto
        {
            TotalAttempts =
                totalAttempts,

            PassedAttempts =
                passedAttempts,

            FailedAttempts =
                failedAttempts,

            PendingAttempts =
                pendingAttempts,

            AverageScore =
                averageScore,

            PassRate =
                passRate,

            Results =
                new PagedReportResultDto
                    <AssessmentResultsReportItemDto>
                {
                    Items =
                        pagedItems,

                    Page =
                        page,

                    PageSize =
                        pageSize,

                    TotalCount =
                        totalCount,

                    TotalPages =
                        totalPages
                }
        };
    }

    // =========================================================
    // CERTIFICATE REPORT
    // =========================================================

    public async Task<CertificateReportDto>
        GetCertificateReportAsync(
            ReportFilterDto filter)
    {
        var dateFrom =
            ToUtc(filter.DateFrom);

        var dateTo =
            ToUtc(filter.DateTo);

        var query = _context.Certificates
            .AsNoTracking()
            .Include(x => x.Enrollment)
                .ThenInclude(x =>
                    x.ParticipantProfile)
                    .ThenInclude(x =>
                        x.User)
            .Include(x => x.Enrollment)
                .ThenInclude(x =>
                    x.TrainingBatch)
                    .ThenInclude(x =>
                        x.TrainingProgram)
            .Include(x => x.Enrollment)
                .ThenInclude(x =>
                    x.TrainingBatch)
                    .ThenInclude(x =>
                        x.TrainerAssignments)
                        .ThenInclude(x =>
                            x.TrainerProfile)
                            .ThenInclude(x =>
                                x.User)
            .AsQueryable();

        // -----------------------------------------------------
        // TRAINING PROGRAM
        // -----------------------------------------------------

        if (filter.TrainingProgramId.HasValue)
        {
            query = query.Where(x =>
                x.Enrollment
                    .TrainingBatch
                    .TrainingProgramId ==
                filter.TrainingProgramId.Value);
        }

        // -----------------------------------------------------
        // TRAINING BATCH
        // -----------------------------------------------------

        if (filter.TrainingBatchId.HasValue)
        {
            query = query.Where(x =>
                x.Enrollment
                    .TrainingBatchId ==
                filter.TrainingBatchId.Value);
        }

        // -----------------------------------------------------
        // TRAINER
        // -----------------------------------------------------

        if (filter.TrainerProfileId.HasValue)
        {
            query = query.Where(x =>
                x.Enrollment
                    .TrainingBatch
                    .TrainerAssignments
                    .Any(a =>
                        a.TrainerProfileId ==
                        filter.TrainerProfileId.Value &&
                        a.IsActive));
        }

        // -----------------------------------------------------
        // DATE FROM
        // -----------------------------------------------------

        if (dateFrom.HasValue)
        {
            query = query.Where(x =>
                x.IssuedAt >=
                dateFrom.Value);
        }

        // -----------------------------------------------------
        // DATE TO
        // -----------------------------------------------------

        if (dateTo.HasValue)
        {
            var exclusiveDateTo =
                dateTo.Value.Date.AddDays(1);

            query = query.Where(x =>
                x.IssuedAt <
                exclusiveDateTo);
        }

        // -----------------------------------------------------
        // STATUS
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status =
                filter.Status.Trim();

            if (status.Equals(
                "Active",
                StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(x =>
                    !x.IsRevoked);
            }
            else if (status.Equals(
                "Revoked",
                StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(x =>
                    x.IsRevoked);
            }
            else if (status.Equals(
                "Participation",
                StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(x =>
                    x.Type ==
                    CertificateType.Participation);
            }
            else if (status.Equals(
                "Completion",
                StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(x =>
                    x.Type ==
                    CertificateType.Completion);
            }
        }

        // -----------------------------------------------------
        // SEARCH
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search =
                filter.Search.Trim();

            query = query.Where(x =>
                x.CertificateNumber
                    .Contains(search)
                ||
                x.VerificationCode
                    .Contains(search)
                ||
                (
                    x.Enrollment
                        .ParticipantProfile
                        .FirstName != null &&
                    x.Enrollment
                        .ParticipantProfile
                        .FirstName
                        .Contains(search)
                )
                ||
                (
                    x.Enrollment
                        .ParticipantProfile
                        .LastName != null &&
                    x.Enrollment
                        .ParticipantProfile
                        .LastName
                        .Contains(search)
                )
                ||
                x.Enrollment
                    .ParticipantProfile
                    .User
                    .Email
                    .Contains(search)
                ||
                x.Enrollment
                    .ParticipantProfile
                    .User
                    .UserCode
                    .Contains(search)
                ||
                x.Enrollment
                    .TrainingBatch
                    .BatchCode
                    .Contains(search)
                ||
                x.Enrollment
                    .TrainingBatch
                    .TrainingProgram
                    .Name
                    .Contains(search)
            );
        }

        // -----------------------------------------------------
        // SUMMARY
        // -----------------------------------------------------

        var totalCertificates =
            await query.CountAsync();

        var completionCertificates =
            await query.CountAsync(x =>
                x.Type ==
                CertificateType.Completion);

        var participationCertificates =
            await query.CountAsync(x =>
                x.Type ==
                CertificateType.Participation);

        var activeCertificates =
            await query.CountAsync(x =>
                !x.IsRevoked);

        var revokedCertificates =
            await query.CountAsync(x =>
                x.IsRevoked);

        // -----------------------------------------------------
        // DATA
        // -----------------------------------------------------

        var certificates =
            await query
                .OrderByDescending(x =>
                    x.IssuedAt)
                .ToListAsync();

        var items =
            new List<CertificateReportItemDto>();

        foreach (var certificate in certificates)
        {
            var enrollment =
                certificate.Enrollment;

            var participant =
                enrollment.ParticipantProfile;

            var user =
                participant.User;

            var batch =
                enrollment.TrainingBatch;

            var program =
                batch.TrainingProgram;

            // -------------------------------------------------
            // PARTICIPANT NAME
            // -------------------------------------------------

            var participantName =
                string.Join(
                    " ",
                    new[]
                    {
                        participant.FirstName,
                        participant.MiddleName,
                        participant.LastName
                    }
                    .Where(x =>
                        !string.IsNullOrWhiteSpace(x)))
                .Trim();

            if (string.IsNullOrWhiteSpace(
                participantName))
            {
                participantName =
                    user.FullName;
            }

            // -------------------------------------------------
            // TRAINER
            // -------------------------------------------------

            var trainerAssignment =
                batch.TrainerAssignments
                    .FirstOrDefault(x =>
                        x.IsActive);

            string? trainerName = null;

            if (trainerAssignment?.TrainerProfile != null)
            {
                trainerName =
                    trainerAssignment
                        .TrainerProfile
                        .User
                        .FullName;
            }

            // -------------------------------------------------
            // ITEM
            // -------------------------------------------------

            items.Add(
                new CertificateReportItemDto
                {
                    CertificateId =
                        certificate.Id,

                    EnrollmentId =
                        enrollment.Id,

                    ParticipantId =
                        participant.Id,

                    ParticipantCode =
                        user.UserCode,

                    ParticipantName =
                        participantName,

                    ParticipantEmail =
                        user.Email,

                    CertificateNumber =
                        certificate.CertificateNumber,

                    CertificateType =
                        certificate.Type.ToString(),

                    TrainingProgramName =
                        program.Name,

                    TrainingBatchId =
                        batch.Id,

                    BatchCode =
                        batch.BatchCode,

                    TrainerName =
                        trainerName,

                    IssuedAt =
                        certificate.IssuedAt,

                    VerificationCode =
                        certificate.VerificationCode,

                    PdfUrl =
                        certificate.PdfUrl,

                    CanvaDesignId =
                        certificate.CanvaDesignId,

                    IsRevoked =
                        certificate.IsRevoked,

                    RevokedAt =
                        certificate.RevokedAt,

                    RevocationReason =
                        certificate.RevocationReason
                });
        }

        // -----------------------------------------------------
        // PAGINATION
        // -----------------------------------------------------

        var page =
            NormalizePage(filter.Page);

        var pageSize =
            NormalizePageSize(filter.PageSize);

        var totalCount =
            items.Count;

        var totalPages =
            CalculateTotalPages(
                totalCount,
                pageSize);

        var pagedItems =
            items
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

        return new CertificateReportDto
        {
            TotalCertificates =
                totalCertificates,

            CompletionCertificates =
                completionCertificates,

            ParticipationCertificates =
                participationCertificates,

            ActiveCertificates =
                activeCertificates,

            RevokedCertificates =
                revokedCertificates,

            Results =
                new PagedReportResultDto
                    <CertificateReportItemDto>
                {
                    Items =
                        pagedItems,

                    Page =
                        page,

                    PageSize =
                        pageSize,

                    TotalCount =
                        totalCount,

                    TotalPages =
                        totalPages
                }
        };
    }

    // =========================================================
    // TRAINER REPORT
    // =========================================================

    public async Task<TrainerReportDto>
        GetTrainerReportAsync(
            ReportFilterDto filter)
    {
        var dateFrom =
            ToUtc(filter.DateFrom);

        var dateTo =
            ToUtc(filter.DateTo);

        var query = _context.TrainerAssignments
            .AsNoTracking()
            .Include(x => x.TrainerProfile)
                .ThenInclude(x => x.User)
            .Include(x => x.TrainingBatch)
                .ThenInclude(x => x.TrainingProgram)
            .AsQueryable();

        // -----------------------------------------------------
        // TRAINING PROGRAM
        // -----------------------------------------------------

        if (filter.TrainingProgramId.HasValue)
        {
            query = query.Where(x =>
                x.TrainingBatch.TrainingProgramId ==
                filter.TrainingProgramId.Value);
        }

        // -----------------------------------------------------
        // TRAINING BATCH
        // -----------------------------------------------------

        if (filter.TrainingBatchId.HasValue)
        {
            query = query.Where(x =>
                x.TrainingBatchId ==
                filter.TrainingBatchId.Value);
        }

        // -----------------------------------------------------
        // TRAINER
        // -----------------------------------------------------

        if (filter.TrainerProfileId.HasValue)
        {
            query = query.Where(x =>
                x.TrainerProfileId ==
                filter.TrainerProfileId.Value);
        }

        // -----------------------------------------------------
        // DATE FROM
        // -----------------------------------------------------

        if (dateFrom.HasValue)
        {
            query = query.Where(x =>
                x.AssignedAt >=
                dateFrom.Value);
        }

        // -----------------------------------------------------
        // DATE TO
        // -----------------------------------------------------

        if (dateTo.HasValue)
        {
            var exclusiveDateTo =
                dateTo.Value.Date.AddDays(1);

            query = query.Where(x =>
                x.AssignedAt <
                exclusiveDateTo);
        }

        // -----------------------------------------------------
        // STATUS
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status =
                filter.Status.Trim();

            if (status.Equals(
                "Active",
                StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(x =>
                    x.IsActive);
            }
            else if (status.Equals(
                "Inactive",
                StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(x =>
                    !x.IsActive);
            }
        }

        // -----------------------------------------------------
        // SEARCH
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search =
                filter.Search.Trim();

            query = query.Where(x =>
                x.TrainerProfile.User.FullName
                    .Contains(search)
                ||
                x.TrainerProfile.User.Email
                    .Contains(search)
                ||
                x.TrainerProfile.User.UserCode
                    .Contains(search)
                ||
                x.TrainingBatch.BatchCode
                    .Contains(search)
            );
        }

        // -----------------------------------------------------
        // LOAD ASSIGNMENTS
        // -----------------------------------------------------

        var assignments =
            await query
                .OrderByDescending(x =>
                    x.AssignedAt)
                .ToListAsync();

        // -----------------------------------------------------
        // GROUP BY TRAINER
        // -----------------------------------------------------

        var groupedAssignments =
            assignments
                .GroupBy(x =>
                    x.TrainerProfileId)
                .ToList();

        var items =
            new List<TrainerReportItemDto>();

        // -----------------------------------------------------
        // BUILD REPORT
        // -----------------------------------------------------

        foreach (var group in groupedAssignments)
        {
            var firstAssignment =
                group.First();

            var trainerProfile =
                firstAssignment.TrainerProfile;

            var trainerUser =
                trainerProfile.User;

            var batchIds =
                group
                    .Select(x =>
                        x.TrainingBatchId)
                    .Distinct()
                    .ToList();

            // -------------------------------------------------
            // PARTICIPANTS
            // -------------------------------------------------

            var trainerParticipantCount =
                await _context.Enrollments
                    .AsNoTracking()
                    .Where(x =>
                        batchIds.Contains(
                            x.TrainingBatchId))
                    .Select(x =>
                        x.ParticipantProfileId)
                    .Distinct()
                    .CountAsync();

            // -------------------------------------------------
            // ATTENDANCE
            // -------------------------------------------------

            var attendanceRecords =
                await _context.AttendanceRecords
                    .AsNoTracking()
                    .Include(x =>
                        x.Enrollment)
                    .Where(x =>
                        batchIds.Contains(
                            x.Enrollment.TrainingBatchId))
                    .ToListAsync();

            var trainerAttendanceCount =
                attendanceRecords.Count;

            var trainerPresentCount =
                attendanceRecords.Count(x =>
                    x.Status ==
                    AttendanceStatus.Present);

            var trainerAbsentCount =
                attendanceRecords.Count(x =>
                    x.Status ==
                    AttendanceStatus.Absent);

            var trainerLateCount =
                attendanceRecords.Count(x =>
                    x.Status ==
                    AttendanceStatus.Late);

            var trainerAttendanceRate =
                trainerAttendanceCount > 0
                    ? Math.Round(
                        (decimal)
                            trainerPresentCount /
                        trainerAttendanceCount *
                        100,
                        2)
                    : 0;

            // -------------------------------------------------
            // ASSESSMENTS
            // -------------------------------------------------

            var assessmentAttempts =
                await _context.AssessmentAttempts
                    .AsNoTracking()
                    .Include(x =>
                        x.WrittenAssessment)
                    .Include(x =>
                        x.Result)
                    .Where(x =>
                        batchIds.Contains(
                            x.WrittenAssessment
                                .TrainingBatchId))
                    .ToListAsync();

            var trainerAssessmentCount =
                assessmentAttempts.Count;

            var trainerPassedAssessmentCount =
                assessmentAttempts.Count(x =>
                    x.Result != null &&
                    x.Result.IsPassed);

            var trainerFailedAssessmentCount =
                assessmentAttempts.Count(x =>
                    x.Result != null &&
                    !x.Result.IsPassed);

            // -------------------------------------------------
            // ASSESSMENT PASS RATE
            // Evaluated attempts only
            // -------------------------------------------------

            var evaluatedAssessmentCount =
                trainerPassedAssessmentCount +
                trainerFailedAssessmentCount;

            var trainerAssessmentPassRate =
                evaluatedAssessmentCount > 0
                    ? Math.Round(
                        (decimal)
                            trainerPassedAssessmentCount /
                        evaluatedAssessmentCount *
                        100,
                        2)
                    : 0;

            // -------------------------------------------------
            // CERTIFICATES
            // -------------------------------------------------

            var certificates =
                await _context.Certificates
                    .AsNoTracking()
                    .Include(x =>
                        x.Enrollment)
                    .Where(x =>
                        batchIds.Contains(
                            x.Enrollment
                                .TrainingBatchId))
                    .ToListAsync();

            var trainerCertificateCount =
                certificates.Count;

            var trainerCompletionCertificateCount =
                certificates.Count(x =>
                    x.Type ==
                    CertificateType.Completion);

            var trainerParticipationCertificateCount =
                certificates.Count(x =>
                    x.Type ==
                    CertificateType.Participation);

            // -------------------------------------------------
            // LAST ASSIGNED
            // -------------------------------------------------

            var lastAssignedAt =
                group
                    .OrderByDescending(x =>
                        x.AssignedAt)
                    .Select(x =>
                        (DateTime?)x.AssignedAt)
                    .FirstOrDefault();

            // -------------------------------------------------
            // ACTIVE
            // -------------------------------------------------

            var trainerIsActive =
                trainerProfile.IsActive;

            // -------------------------------------------------
            // TRAINER NAME
            // -------------------------------------------------

            var trainerName =
                !string.IsNullOrWhiteSpace(
                    trainerUser.FullName)
                    ? trainerUser.FullName
                    : string.Join(
                        " ",
                        new[]
                        {
                            trainerProfile.FirstName,
                            trainerProfile.MiddleName,
                            trainerProfile.LastName,
                            trainerProfile.Suffix
                        }
                        .Where(x =>
                            !string.IsNullOrWhiteSpace(x)));

            // -------------------------------------------------
            // ADD ITEM
            // -------------------------------------------------

            items.Add(
                new TrainerReportItemDto
                {
                    TrainerProfileId =
                        trainerProfile.Id,

                    TrainerCode =
                        trainerUser.UserCode,

                    TrainerName =
                        trainerName,

                    TrainerEmail =
                        trainerUser.Email,

                    AssignedBatches =
                        batchIds.Count,

                    TotalParticipants =
                        trainerParticipantCount,

                    TotalAttendanceRecords =
                        trainerAttendanceCount,

                    PresentAttendance =
                        trainerPresentCount,

                    AbsentAttendance =
                        trainerAbsentCount,

                    LateAttendance =
                        trainerLateCount,

                    AttendanceRate =
                        trainerAttendanceRate,

                    TotalAssessmentAttempts =
                        trainerAssessmentCount,

                    PassedAssessments =
                        trainerPassedAssessmentCount,

                    FailedAssessments =
                        trainerFailedAssessmentCount,

                    AssessmentPassRate =
                        trainerAssessmentPassRate,

                    TotalCertificates =
                        trainerCertificateCount,

                    CompletionCertificates =
                        trainerCompletionCertificateCount,

                    ParticipationCertificates =
                        trainerParticipationCertificateCount,

                    LastAssignedAt =
                        lastAssignedAt,

                    IsActive =
                        trainerIsActive
                });
        }

        // -----------------------------------------------------
        // SUMMARY
        // -----------------------------------------------------

        var totalTrainerCount =
            items.Count;

        var activeTrainerCount =
            items.Count(x =>
                x.IsActive);

        var totalAssignmentCount =
            assignments.Count;

        var totalParticipantCount =
            items.Sum(x =>
                x.TotalParticipants);

        // -----------------------------------------------------
        // PAGINATION
        // -----------------------------------------------------

        var page =
            NormalizePage(filter.Page);

        var pageSize =
            NormalizePageSize(filter.PageSize);

        var totalCount =
            items.Count;

        var totalPages =
            CalculateTotalPages(
                totalCount,
                pageSize);

        var pagedItems =
            items
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

        return new TrainerReportDto
        {
            TotalTrainers =
                totalTrainerCount,

            ActiveTrainers =
                activeTrainerCount,

            TotalAssignments =
                totalAssignmentCount,

            TotalParticipants =
                totalParticipantCount,

            Results =
                new PagedReportResultDto
                    <TrainerReportItemDto>
                {
                    Items =
                        pagedItems,

                    Page =
                        page,

                    PageSize =
                        pageSize,

                    TotalCount =
                        totalCount,

                    TotalPages =
                        totalPages
                }
        };
    }

    // =========================================================
    // SERVICE REQUEST REPORT
    // =========================================================

    public async Task<ServiceRequestReportDto>
        GetServiceRequestReportAsync(
            ReportFilterDto filter)
    {
        var dateFrom =
            ToUtc(filter.DateFrom);

        var dateTo =
            ToUtc(filter.DateTo);

        var query = _context.ServiceRequests
            .AsNoTracking()
            .Include(x => x.Service)
            .Include(x => x.User)
            .Include(x => x.ReviewedByUser)
            .AsQueryable();

        // -----------------------------------------------------
        // TRAINING PROGRAM
        // Not applicable.
        // -----------------------------------------------------

        // -----------------------------------------------------
        // TRAINING BATCH
        // Not applicable.
        // -----------------------------------------------------

        // -----------------------------------------------------
        // TRAINER
        // Not applicable.
        // -----------------------------------------------------

        // -----------------------------------------------------
        // DATE FROM
        // -----------------------------------------------------

        if (dateFrom.HasValue)
        {
            query = query.Where(x =>
                x.RequestedAt >=
                dateFrom.Value);
        }

        // -----------------------------------------------------
        // DATE TO
        // -----------------------------------------------------

        if (dateTo.HasValue)
        {
            var exclusiveDateTo =
                dateTo.Value.Date.AddDays(1);

            query = query.Where(x =>
                x.RequestedAt <
                exclusiveDateTo);
        }

        // -----------------------------------------------------
        // STATUS
        // IMPORTANT:
        // Parse enum outside IQueryable.
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status =
                filter.Status.Trim();

            if (Enum.TryParse<ServiceRequestStatus>(
                status,
                true,
                out var serviceRequestStatus))
            {
                query = query.Where(x =>
                    x.Status ==
                    serviceRequestStatus);
            }
        }

        // -----------------------------------------------------
        // SEARCH
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search =
                filter.Search.Trim();

            query = query.Where(x =>
                x.ApplicantName
                    .Contains(search)
                ||
                x.ApplicantEmail
                    .Contains(search)
                ||
                x.Service.Name
                    .Contains(search)
                ||
                x.Service.ServiceCode
                    .Contains(search)
                ||
                x.Service.Category
                    .Contains(search)
            );
        }

        // -----------------------------------------------------
        // LOAD DATA
        // -----------------------------------------------------

        var requests =
            await query
                .OrderByDescending(x =>
                    x.RequestedAt)
                .ToListAsync();

        // -----------------------------------------------------
        // SUMMARY
        // -----------------------------------------------------

        var totalRequests =
            requests.Count;

        var pendingRequests =
            requests.Count(x =>
                x.Status ==
                ServiceRequestStatus.Pending);

        var approvedRequests =
            requests.Count(x =>
                x.Status ==
                ServiceRequestStatus.Approved);

        var rejectedRequests =
            requests.Count(x =>
                x.Status ==
                ServiceRequestStatus.Rejected);

        var reviewedRequests =
            requests.Count(x =>
                x.ReviewedAt.HasValue);

        // -----------------------------------------------------
        // MAP ITEMS
        // -----------------------------------------------------

        var items =
            requests
                .Select(x =>
                {
                    var reviewerName =
                        x.ReviewedByUser?.FullName;

                    return new ServiceRequestReportItemDto
                    {
                        ServiceRequestId =
                            x.Id,

                        ServiceId =
                            x.ServiceId,

                        ServiceCode =
                            x.Service?.ServiceCode
                            ?? string.Empty,

                        ServiceName =
                            x.Service?.Name
                            ?? string.Empty,

                        ServiceCategory =
                            x.Service?.Category
                            ?? string.Empty,

                        RequiresTraining =
                            x.Service?.RequiresTraining
                            ?? false,

                        UserId =
                            x.UserId,

                        ApplicantName =
                            x.ApplicantName,

                        ApplicantEmail =
                            x.ApplicantEmail,

                        Remarks =
                            x.Remarks,

                        RequestStatus =
                            x.Status.ToString(),

                        RequestedAt =
                            x.RequestedAt,

                        ReviewedAt =
                            x.ReviewedAt,

                        ReviewedByUserId =
                            x.ReviewedByUserId,

                        ReviewerName =
                            reviewerName,

                        ResolutionType =
                            x.ResolutionType?.ToString(),

                        AdminRemarks =
                            x.AdminRemarks
                    };
                })
                .ToList();

        // -----------------------------------------------------
        // PAGINATION
        // -----------------------------------------------------

        var page =
            NormalizePage(filter.Page);

        var pageSize =
            NormalizePageSize(filter.PageSize);

        var totalCount =
            items.Count;

        var totalPages =
            CalculateTotalPages(
                totalCount,
                pageSize);

        var pagedItems =
            items
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

        // -----------------------------------------------------
        // RETURN
        // -----------------------------------------------------

        return new ServiceRequestReportDto
        {
            TotalRequests =
                totalRequests,

            PendingRequests =
                pendingRequests,

            ApprovedRequests =
                approvedRequests,

            RejectedRequests =
                rejectedRequests,

            ReviewedRequests =
                reviewedRequests,

            Results =
                new PagedReportResultDto
                    <ServiceRequestReportItemDto>
                {
                    Items =
                        pagedItems,

                    Page =
                        page,

                    PageSize =
                        pageSize,

                    TotalCount =
                        totalCount,

                    TotalPages =
                        totalPages
                }
        };
    }

    // =========================================================
    // DATE/TIME HELPERS
    // =========================================================

    /// <summary>
    /// Converts nullable DateTime values to UTC.
    ///
    /// Query-string DateTime values commonly arrive as
    /// DateTimeKind.Unspecified.
    ///
    /// For report filters, unspecified values are treated
    /// as UTC calendar dates.
    /// </summary>
    private static DateTime? ToUtc(
        DateTime? value)
    {
        if (!value.HasValue)
        {
            return null;
        }

        return value.Value.Kind switch
        {
            DateTimeKind.Utc =>
                value.Value,

            DateTimeKind.Local =>
                value.Value.ToUniversalTime(),

            DateTimeKind.Unspecified =>
                DateTime.SpecifyKind(
                    value.Value,
                    DateTimeKind.Utc),

            _ =>
                DateTime.SpecifyKind(
                    value.Value,
                    DateTimeKind.Utc)
        };
    }

    // =========================================================
    // PAGE NORMALIZATION
    // =========================================================

    private static int NormalizePage(
        int page)
    {
        return page < 1
            ? 1
            : page;
    }

    private static int NormalizePageSize(
        int pageSize)
    {
        return pageSize < 1
            ? 25
            : Math.Min(
                pageSize,
                100);
    }

    private static int CalculateTotalPages(
        int totalCount,
        int pageSize)
    {
        if (totalCount == 0)
        {
            return 0;
        }

        return (int)Math.Ceiling(
            totalCount /
            (double)pageSize);
    }
}