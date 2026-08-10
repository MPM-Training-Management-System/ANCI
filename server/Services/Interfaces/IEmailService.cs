namespace server.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendOtpEmailAsync(
            string email,
            string otp
        );
    }
}