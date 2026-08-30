using server.DTOs.Auth;
using server.DTOs.Trainer;

namespace server.Services.Interfaces;

public interface IAuthService
{
    // =========================================================
    // PARTICIPANT
    // =========================================================

    Task<UserRegistrationResponse>
        RegisterParticipantAsync(
            RegisterParticipantRequest request
        );


    // =========================================================
    // TRAINER
    // =========================================================

    Task<UserRegistrationResponse>
        RegisterTrainerAsync(
            RegisterTrainerRequest request
        );


    // =========================================================
    // LOGIN
    // =========================================================

    Task<LoginResponse>
        LoginAsync(
            LoginRequest request
        );
}