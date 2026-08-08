using server.DTOs.Trainer;

namespace server.Services.Interfaces;

public interface ITrainerService
{
    // Register Account
    Task RegisterAsync(RegisterTrainerDTO dto);

    // Complete Profile
    Task CompleteProfileAsync(
        Guid trainerId,
        CompleteTrainerProfileDTO dto);

    // Update Profile
    Task UpdateAsync(
        Guid id,
        UpdateTrainerDTO dto);

    // Read
    Task<List<TrainerListDTO>> GetAllAsync();

    Task<TrainerResponseDTO?> GetByIdAsync(Guid id);

    // Delete (Soft Delete)
    Task DeleteAsync(Guid id);

    // Activate / Deactivate
    Task ChangeStatusAsync(
        Guid id,
        bool isActive);

    // Verify Trainer
    Task VerifyAsync(
        Guid id,
        bool isVerified);
}