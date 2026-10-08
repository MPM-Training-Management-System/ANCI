using Microsoft.AspNetCore.Http;
using server.DTOs.Trainer;

namespace server.Interfaces.Trainer;

public interface ITrainerReportRequestService
{
    Task<TrainerReportRequestDto>
        CreateAsync(
            Guid userId,
            CreateTrainerReportRequestDto dto);

    Task<IReadOnlyList<TrainerReportRequestDto>>
        GetMyRequestsAsync(
            Guid userId);

    Task<IReadOnlyList<AdminTrainerReportRequestDto>>
        GetAdminRequestsAsync();

    Task<AdminTrainerReportRequestDto>
        ApproveAndGenerateAsync(
            Guid adminUserId,
            Guid requestId,
            IFormFile file,
            string? adminRemarks);

    Task<AdminTrainerReportRequestDto>
        RejectAsync(
            Guid adminUserId,
            Guid requestId,
            ReviewTrainerReportRequestDto dto);
}