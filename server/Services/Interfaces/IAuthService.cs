using server.DTOs.Auth;
using server.DTOs.Otp;
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


    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    Task<OtpResponse>
        ForgotPasswordAsync(
            ForgotPasswordRequest request
        );


    // =========================================================
    // VERIFY PASSWORD RESET OTP
    // =========================================================

    Task<OtpResponse>
        VerifyPasswordResetOtpAsync(
            VerifyResetOtpRequest request
        );


    // =========================================================
    // RESET PASSWORD
    // =========================================================

    Task<OtpResponse>
        ResetPasswordAsync(
            ResetPasswordRequest request
        );


    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    Task<OtpResponse>
        ChangePasswordAsync(
            Guid userId,
            ChangePasswordRequest request
        );
}