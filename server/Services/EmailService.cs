using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
using server.Models;
using server.Services.Interfaces;

namespace server.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;

        public EmailService(IOptions<EmailSettings> options)
        {
            _settings = options.Value;
        }

        public async Task SendOtpEmailAsync(
            string email,
            string otp)
        {
            using var message = new MailMessage();

            message.From = new MailAddress(
                _settings.From,
                _settings.DisplayName
            );

            message.To.Add(email);

            message.Subject = "ANCI - Email Verification Code";

            message.Body = $"""
                Hello!

                Your ANCI verification code is:

                {otp}

                This code will expire in 5 minutes.

                If you did not request this code, please ignore this email.

                Regards,
                ANCI Team
                """;

            message.IsBodyHtml = false;

            using var smtp = new SmtpClient(
                _settings.Host,
                _settings.Port
            );

            smtp.EnableSsl = true;

            smtp.Credentials = new NetworkCredential(
                _settings.Username,
                _settings.Password
            );

            await smtp.SendMailAsync(message);
        }
    }
}