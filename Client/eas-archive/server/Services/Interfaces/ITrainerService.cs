using server.DTOs.Trainer;

namespace server.Services.Interfaces;

public interface ITrainerService
{
    Task<IEnumerable<TrainerResponseDTO>>
        GetAllAsync();

    Task<TrainerResponseDTO?>
        GetByIdAsync(Guid id);

    Task<TrainerResponseDTO>
        CompleteProfileAsync(
            Guid userId,
            CompleteTrainerProfileDTO dto);

    Task<TrainerResponseDTO?>
        UpdateAsync(
            Guid id,
            UpdateTrainerDTO dto);

    Task<bool>
        UpdateStatusAsync(
            Guid id,
            bool isActive);

    Task VerifyAsync(
        Guid id,
        bool isApproved);

    Task<bool>
        DeleteAsync(Guid id);
}