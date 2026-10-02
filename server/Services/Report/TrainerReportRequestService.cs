using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Trainer;
using server.Enums;
using server.DTOs.Reports;
using server.Interfaces.Trainer;
using server.Models.Trainer;

namespace server.Services.Trainer;

public class TrainerReportRequestService
    : ITrainerReportRequestService
{
    private readonly ApplicationDbContext _db;

    public TrainerReportRequestService(
        ApplicationDbContext db)
    {
        _db = db;
    }

    // =========================================================
    // CREATE REPORT REQUEST
    // =========================================================

    public async Task<TrainerReportRequestDto>
        CreateAsync(
            Guid userId,
            CreateTrainerReportRequestDto dto)
    {
        // -----------------------------------------------------
        // GET TRAINER PROFILE
        // -----------------------------------------------------

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

        // -----------------------------------------------------
        // VALIDATE REPORT TYPE
        // -----------------------------------------------------

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

        // -----------------------------------------------------
        // CHECK TRAINER ASSIGNMENT
        // -----------------------------------------------------

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

        // -----------------------------------------------------
        // VALIDATE DATE RANGE
        // -----------------------------------------------------

        if (
            dto.DateFrom.HasValue &&
            dto.DateTo.HasValue &&
            dto.DateFrom.Value > dto.DateTo.Value)
        {
            throw new InvalidOperationException(
                "Date From cannot be later than Date To.");
        }

        // -----------------------------------------------------
        // CHECK DUPLICATE PENDING REQUEST
        // -----------------------------------------------------

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

        // -----------------------------------------------------
        // CREATE REQUEST
        // -----------------------------------------------------

        var request =
            new TrainerReportRequest
            {
                Id = Guid.NewGuid(),

                TrainerProfileId =
                    trainerProfile.Id,

                TrainingBatchId =
                    assignment.TrainingBatchId,

                ReportType =
                    reportType,

                DateFrom =
                    dto.DateFrom,

                DateTo =
                    dto.DateTo,

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

        // -----------------------------------------------------
        // RETURN DTO
        // -----------------------------------------------------

        return MapToDto(
            request,
            assignment.TrainingBatch.BatchCode,
            assignment.TrainingBatch
                .TrainingProgram
                .Name);
    }

    // =========================================================
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
    // MAP DTO
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
}