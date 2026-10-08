using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Trainer;
using server.Enums;
using server.Interfaces.Trainer;
using server.Models.Trainer;
using server.Services.Interfaces;

namespace server.Services.Trainer;

public class TrainerReportRequestService
    : ITrainerReportRequestService
{
    private readonly ApplicationDbContext _db;
    private readonly ICloudinaryService _cloudinaryService;

    public TrainerReportRequestService(
        ApplicationDbContext db,
        ICloudinaryService cloudinaryService)
    {
        _db = db;
        _cloudinaryService = cloudinaryService;
    }


    // =========================================================
    // TRAINER
    // CREATE REQUEST
    // =========================================================

    public async Task<TrainerReportRequestDto>
        CreateAsync(
            Guid userId,
            CreateTrainerReportRequestDto dto)
    {
        var trainerProfile =
            await _db.TrainerProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.UserId == userId);

        if (trainerProfile == null)
        {
            throw new InvalidOperationException(
                "Trainer profile was not found.");
        }

        var allowedReportTypes =
            new[]
            {
                "Attendance",
                "Assessment",
                "TrainingSummary",
                "Certificate"
            };

        var reportType =
            dto.ReportType.Trim();

        var validReportType =
            allowedReportTypes.Any(
                x => string.Equals(
                    x,
                    reportType,
                    StringComparison.OrdinalIgnoreCase));

        if (!validReportType)
        {
            throw new InvalidOperationException(
                "Invalid report type.");
        }

        reportType =
            allowedReportTypes.First(
                x => string.Equals(
                    x,
                    reportType,
                    StringComparison.OrdinalIgnoreCase));


        // =====================================================
        // CHECK TRAINER ASSIGNMENT
        // =====================================================

        var assignment =
            await _db.TrainerAssignments
                .AsNoTracking()
                .Include(x => x.TrainingBatch)
                    .ThenInclude(x =>
                        x.TrainingProgram)
                .FirstOrDefaultAsync(
                    x =>
                        x.TrainerProfileId ==
                            trainerProfile.Id
                        &&
                        x.TrainingBatchId ==
                            dto.TrainingBatchId
                        &&
                        x.IsActive);

        if (assignment == null)
        {
            throw new UnauthorizedAccessException(
                "You are not assigned to this training batch.");
        }


        // =====================================================
        // NORMALIZE DATE VALUES TO UTC
        // =====================================================

        DateTime? dateFrom = null;
        DateTime? dateTo = null;

        if (dto.DateFrom.HasValue)
        {
            dateFrom =
                DateTime.SpecifyKind(
                    dto.DateFrom.Value,
                    DateTimeKind.Utc);
        }

        if (dto.DateTo.HasValue)
        {
            dateTo =
                DateTime.SpecifyKind(
                    dto.DateTo.Value,
                    DateTimeKind.Utc);
        }

        if (
            dateFrom.HasValue &&
            dateTo.HasValue &&
            dateFrom.Value > dateTo.Value)
        {
            throw new InvalidOperationException(
                "Date From cannot be later than Date To.");
        }


        // =====================================================
        // CHECK DUPLICATE PENDING REQUEST
        // =====================================================

        var hasPendingRequest =
            await _db.TrainerReportRequests
                .AnyAsync(
                    x =>
                        x.TrainerProfileId ==
                            trainerProfile.Id
                        &&
                        x.TrainingBatchId ==
                            dto.TrainingBatchId
                        &&
                        x.ReportType ==
                            reportType
                        &&
                        x.Status ==
                            TrainerReportRequestStatus.Pending);

        if (hasPendingRequest)
        {
            throw new InvalidOperationException(
                "You already have a pending request for this report.");
        }


        // =====================================================
        // CREATE REQUEST
        // =====================================================

        var request =
            new TrainerReportRequest
            {
                Id =
                    Guid.NewGuid(),

                TrainerProfileId =
                    trainerProfile.Id,

                TrainingBatchId =
                    assignment.TrainingBatchId,

                ReportType =
                    reportType,

                DateFrom =
                    dateFrom,

                DateTo =
                    dateTo,

                Reason =
                    string.IsNullOrWhiteSpace(dto.Reason)
                        ? null
                        : dto.Reason.Trim(),

                Status =
                    TrainerReportRequestStatus.Pending,

                RequestedAt =
                    DateTime.UtcNow
            };

        _db.TrainerReportRequests.Add(
            request);

        await _db.SaveChangesAsync();

        return MapToDto(
            request,
            assignment.TrainingBatch.BatchCode,
            assignment.TrainingBatch
                .TrainingProgram
                .Name);
    }


    // =========================================================
    // TRAINER
    // GET MY REQUESTS
    // =========================================================

    public async Task<
        IReadOnlyList<TrainerReportRequestDto>>
        GetMyRequestsAsync(
            Guid userId)
    {
        var trainerProfile =
            await _db.TrainerProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.UserId == userId);

        if (trainerProfile == null)
        {
            throw new InvalidOperationException(
                "Trainer profile was not found.");
        }

        var requests =
            await _db.TrainerReportRequests
                .AsNoTracking()
                .Include(x =>
                    x.TrainingBatch)
                    .ThenInclude(x =>
                        x.TrainingProgram)
                .Where(
                    x =>
                        x.TrainerProfileId ==
                        trainerProfile.Id)
                .OrderByDescending(
                    x => x.RequestedAt)
                .ToListAsync();

        return requests
            .Select(
                x =>
                    MapToDto(
                        x,
                        x.TrainingBatch.BatchCode,
                        x.TrainingBatch
                            .TrainingProgram
                            .Name))
            .ToList();
    }


    // =========================================================
    // ADMIN
    // GET ALL REQUESTS
    // =========================================================

    public async Task<
        IReadOnlyList<AdminTrainerReportRequestDto>>
        GetAdminRequestsAsync()
    {
        var requests =
            await _db.TrainerReportRequests
                .AsNoTracking()
                .Include(x =>
                    x.TrainerProfile)
                .Include(x =>
                    x.TrainingBatch)
                    .ThenInclude(x =>
                        x.TrainingProgram)
                .OrderByDescending(
                    x => x.RequestedAt)
                .ToListAsync();

        return requests
            .Select(
                MapToAdminDto)
            .ToList();
    }


    // =========================================================
    // ADMIN
    // APPROVE + GENERATE REPORT
    // =========================================================

    public async Task<
        AdminTrainerReportRequestDto>
        ApproveAndGenerateAsync(
            Guid adminUserId,
            Guid requestId,
            IFormFile file,
            string? adminRemarks)
    {
        // =====================================================
        // FIND REQUEST
        // =====================================================

        var request =
            await _db.TrainerReportRequests
                .Include(x =>
                    x.TrainerProfile)
                .Include(x =>
                    x.TrainingBatch)
                    .ThenInclude(x =>
                        x.TrainingProgram)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == requestId);

        if (request == null)
        {
            throw new InvalidOperationException(
                "Report request was not found.");
        }


        // =====================================================
        // ONLY PENDING REQUESTS CAN BE PROCESSED
        // =====================================================

        if (
            request.Status !=
            TrainerReportRequestStatus.Pending)
        {
            throw new InvalidOperationException(
                "Only pending report requests can be approved.");
        }


        // =====================================================
        // VALIDATE FILE
        // =====================================================

        if (file == null)
        {
            throw new InvalidOperationException(
                "Generated report PDF is required.");
        }

        if (file.Length <= 0)
        {
            throw new InvalidOperationException(
                "The generated report PDF is empty.");
        }


        var extension =
            Path.GetExtension(
                file.FileName);

        if (
            string.IsNullOrWhiteSpace(extension) ||
            !extension.Equals(
                ".pdf",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "Only PDF report files are allowed.");
        }


        if (
            !string.IsNullOrWhiteSpace(file.ContentType) &&
            !file.ContentType.Equals(
                "application/pdf",
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "The uploaded report must be a PDF file.");
        }


        // =====================================================
        // UPLOAD GENERATED PDF TO CLOUDINARY
        // =====================================================

        (string Url, string PublicId) upload;

        try
        {
            await using var stream =
                file.OpenReadStream();

            upload =
                await _cloudinaryService
                    .UploadDocumentAsync(
                        stream,
                        file.FileName,
                        "ace-nextgen/reports");
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                $"Failed to upload the generated report: {ex.Message}",
                ex);
        }


        // =====================================================
        // SAVE REPORT INFORMATION
        // =====================================================

        try
        {
            request.Status =
                TrainerReportRequestStatus.Approved;

            request.ReportFileUrl =
                upload.Url;

            request.ReviewedAt =
                DateTime.UtcNow;

            request.ReviewedByUserId =
                adminUserId;

            request.AdminRemarks =
                string.IsNullOrWhiteSpace(
                    adminRemarks)
                    ? null
                    : adminRemarks.Trim();

            await _db.SaveChangesAsync();
        }
        catch
        {
            // If database saving fails after Cloudinary upload,
            // attempt to remove the orphaned Cloudinary file.

            try
            {
                if (
                    !string.IsNullOrWhiteSpace(
                        upload.PublicId))
                {
                    await _cloudinaryService
                        .DeleteDocumentAsync(
                            upload.PublicId);
                }
            }
            catch
            {
                // Do not hide the original database exception.
            }

            throw;
        }


        // =====================================================
        // RETURN UPDATED REQUEST
        // =====================================================

        return MapToAdminDto(
            request);
    }


    // =========================================================
    // ADMIN
    // REJECT
    // =========================================================

    public async Task<
        AdminTrainerReportRequestDto>
        RejectAsync(
            Guid adminUserId,
            Guid requestId,
            ReviewTrainerReportRequestDto dto)
    {
        var request =
            await _db.TrainerReportRequests
                .Include(x =>
                    x.TrainerProfile)
                .Include(x =>
                    x.TrainingBatch)
                    .ThenInclude(x =>
                        x.TrainingProgram)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == requestId);

        if (request == null)
        {
            throw new InvalidOperationException(
                "Report request was not found.");
        }

        if (
            request.Status !=
            TrainerReportRequestStatus.Pending)
        {
            throw new InvalidOperationException(
                "Only pending report requests can be rejected.");
        }


        // =====================================================
        // UPDATE STATUS
        // =====================================================

        request.Status =
            TrainerReportRequestStatus.Rejected;

        request.ReviewedAt =
            DateTime.UtcNow;

        request.ReviewedByUserId =
            adminUserId;

        request.AdminRemarks =
            string.IsNullOrWhiteSpace(
                dto.AdminRemarks)
                ? null
                : dto.AdminRemarks.Trim();

        await _db.SaveChangesAsync();


        return MapToAdminDto(
            request);
    }


    // =========================================================
    // TRAINER DTO MAPPER
    // =========================================================

    private static TrainerReportRequestDto
        MapToDto(
            TrainerReportRequest request,
            string batchCode,
            string trainingProgramName)
    {
        return new TrainerReportRequestDto
        {
            Id =
                request.Id,

            TrainingBatchId =
                request.TrainingBatchId,

            BatchCode =
                batchCode,

            TrainingProgramName =
                trainingProgramName,

            ReportType =
                request.ReportType,

            DateFrom =
                request.DateFrom,

            DateTo =
                request.DateTo,

            Reason =
                request.Reason,

            Status =
                request.Status.ToString(),

            RequestedAt =
                request.RequestedAt,

            ReviewedAt =
                request.ReviewedAt,

            AdminRemarks =
                request.AdminRemarks,

            ReportFileUrl =
                request.ReportFileUrl
        };
    }


    // =========================================================
    // ADMIN DTO MAPPER
    // =========================================================

    private static AdminTrainerReportRequestDto
        MapToAdminDto(
            TrainerReportRequest request)
    {
        var trainerName =
            request.TrainerProfile?.ActivatedAt.HasValue == true
                ? $"{request.TrainerProfile.FirstName} {request.TrainerProfile.LastName}"
                : string.Empty;


        var trainerCode =
            request.TrainerProfile?.ActivatedAt.HasValue == true
                ? request.TrainerProfile.UserId.ToString()
                : string.Empty;


        return new AdminTrainerReportRequestDto
        {
            Id =
                request.Id,

            TrainerProfileId =
                request.TrainerProfileId,

            TrainingBatchId =
                request.TrainingBatchId,

            TrainerName =
                trainerName,

            TrainerCode =
                trainerCode,

            BatchCode =
                request.TrainingBatch?.BatchCode
                ?? string.Empty,

            TrainingProgramName =
                request.TrainingBatch?
                    .TrainingProgram?
                    .Name
                ?? string.Empty,

            ReportType =
                request.ReportType,

            DateFrom =
                request.DateFrom,

            DateTo =
                request.DateTo,

            Reason =
                request.Reason,

            Status =
                request.Status.ToString(),

            RequestedAt =
                request.RequestedAt,

            ReviewedAt =
                request.ReviewedAt,

            ReviewedByUserId =
                request.ReviewedByUserId,

            AdminRemarks =
                request.AdminRemarks,

            ReportFileUrl =
                request.ReportFileUrl
        };
    }
}