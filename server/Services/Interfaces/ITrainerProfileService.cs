using server.DTOs.Trainer;

namespace server.Services.Interfaces;

public interface ITrainerProfileService
{
    // =========================================================
    // GET MY PROFILE
    // =========================================================

    Task<TrainerProfileDto?>
        GetMyProfileAsync(
            Guid userId
        );


    // =========================================================
    // UPDATE MY PROFILE
    // =========================================================

    Task<TrainerProfileDto?>
        UpdateMyProfileAsync(
            Guid userId,
            UpdateTrainerProfileRequest request
        );


    // =========================================================
    // GET PROFILE BY ID
    // ADMIN
    // =========================================================

    Task<TrainerProfileDto?>
        GetByIdAsync(
            Guid id
        );


    // =========================================================
    // GET ACTIVE TRAINERS
    // ADMIN
    // =========================================================

    Task<List<TrainerProfileDto>>
        GetActiveTrainersAsync();
}