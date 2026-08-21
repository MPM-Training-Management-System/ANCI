using server.DTOs.Otp;

namespace server.Services.Interfaces;

public interface IOtpService
{
    Task<OtpResponse> SendVerificationOtpAsync(
        SendOtpRequest request
    );

    Task<OtpResponse> VerifyOtpAsync(
        VerifyOtpRequest request
    );
}