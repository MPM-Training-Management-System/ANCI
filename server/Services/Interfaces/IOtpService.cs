namespace server.Services.Interfaces
{
    public interface IOtpService
    {
        Task<string> GenerateOtpAsync(
            Guid userId,
            string purpose = "EmailVerification"
        );

        Task<bool> VerifyOtpAsync(
            Guid userId,
            string otp,
            string purpose = "EmailVerification"
        );
    }
}