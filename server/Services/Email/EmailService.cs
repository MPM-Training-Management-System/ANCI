using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using server.Settings;
using server.DTOs.Email;

namespace server.Services.Email;

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;

    public EmailService(
        EmailSettings settings
    )
    {
        _settings = settings;
    }

    public async Task SendAsync(
        SendEmailDto email
    )
    {
        if (string.IsNullOrWhiteSpace(
                email.ToEmail))
        {
            throw new ArgumentException(
                "Recipient email is required."
            );
        }

        if (string.IsNullOrWhiteSpace(
                email.Subject))
        {
            throw new ArgumentException(
                "Email subject is required."
            );
        }

        if (string.IsNullOrWhiteSpace(
                email.Body))
        {
            throw new ArgumentException(
                "Email body is required."
            );
        }

        var message = new MimeMessage();

        // Sender
        message.From.Add(
            new MailboxAddress(
                _settings.FromName,
                _settings.FromEmail
            )
        );

        // Recipient
        message.To.Add(
            MailboxAddress.Parse(
                email.ToEmail.Trim()
            )
        );

        // Subject
        message.Subject = email.Subject.Trim();

        var bodyBuilder = new BodyBuilder();

        if (email.IsHtml)
        {
            bodyBuilder.HtmlBody = email.Body;
        }
        else
        {
            bodyBuilder.TextBody = email.Body;
        }

        message.Body =
            bodyBuilder.ToMessageBody();

        using var smtp = new SmtpClient();

        var socketOption =
            _settings.EnableSsl
                ? SecureSocketOptions.StartTls
                : SecureSocketOptions.Auto;

        try
        {
            // Connect to SMTP server
            await smtp.ConnectAsync(
                _settings.Host,
                _settings.Port,
                socketOption
            );

            // Authenticate
            await smtp.AuthenticateAsync(
                _settings.Username,
                _settings.Password
            );

            // Send email
            await smtp.SendAsync(
                message
            );
        }
        finally
        {
            // Always disconnect properly
            if (smtp.IsConnected)
            {
                await smtp.DisconnectAsync(
                    true
                );
            }
        }
    }
}