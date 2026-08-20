using server.DTOs.Auth;

namespace server.Services.Interfaces;

public interface IAuthService
{
    Task<UserRegistrationResponse> RegisterParticipantAsync(
        RegisterRequest request
    );
    Task<LoginResponse>
        LoginAsync(
            LoginRequest request
        );

}