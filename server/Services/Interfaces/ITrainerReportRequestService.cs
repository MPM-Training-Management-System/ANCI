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
        ApproveAsync(
            Guid adminUserId,
            Guid requestId,
            ReviewTrainerReportRequestDto dto);

    Task<AdminTrainerReportRequestDto>
        RejectAsync(
            Guid adminUserId,
            Guid requestId,
            ReviewTrainerReportRequestDto dto);
}