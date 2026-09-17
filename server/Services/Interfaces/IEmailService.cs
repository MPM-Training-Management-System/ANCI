using server.DTOs.Email;

namespace server.Services.Email;

public interface IEmailService
{
    Task SendAsync(
        SendEmailDto email
    );
}