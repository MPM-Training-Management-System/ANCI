using server.DTOs.Auth;

namespace server.Services.Interfaces;

public interface IAuthService
{
    Task<UserRegistrationResponse>
        RegisterParticipantAsync(
            RegisterParticipantRequest request
        );

    Task<UserRegistrationResponse>
        RegisterTrainerAsync(
            RegisterTrainerRequest request
        );

    Task<LoginResponse>
        LoginAsync(
            LoginRequest request
        );
}