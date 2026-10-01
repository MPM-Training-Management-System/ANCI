using server.DTOs.Auth;

namespace server.Services.Interfaces;

public interface IGoogleAuthService
{
    Task<GoogleLoginResponse> AuthenticateAsync(
        string idToken,
        CancellationToken cancellationToken = default);

    Task<GoogleLoginResponse> ValidateTokenAsync(
        string idToken,
        CancellationToken cancellationToken = default);
}