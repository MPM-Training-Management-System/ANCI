using server.DTOs.Otp;

namespace server.Services.Interfaces;

public interface IOtpService
{
    // Email verification
    Task<OtpResponse> SendVerificationOtpAsync(
        SendOtpRequest request
    );

    Task<OtpResponse> VerifyOtpAsync(
        VerifyOtpRequest request
    );

    // Password reset
    Task<OtpResponse> SendPasswordResetOtpAsync(
        SendOtpRequest request
    );

    Task<OtpResponse> VerifyPasswordResetOtpAsync(
        VerifyOtpRequest request
    );

    // Login 2FA
    Task<OtpResponse> SendLoginOtpAsync(
        SendOtpRequest request
    );

    Task<OtpResponse> VerifyLoginOtpAsync(
        VerifyOtpRequest request
    );
}