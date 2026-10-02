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
}