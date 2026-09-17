using Microsoft.AspNetCore.Mvc;
using server.DTOs.Email;
using server.Services.Email;

namespace server.Controllers;

[ApiController]
[Route("api/email-test")]
public class EmailTestController : ControllerBase
{
    private readonly IEmailService _emailService;

    public EmailTestController(
        IEmailService emailService
    )
    {
        _emailService = emailService;
    }

    [HttpPost]
    public async Task<IActionResult> SendTestEmail(
        [FromBody] SendEmailDto dto
    )
    {
        try
        {
            await _emailService.SendAsync(dto);

            return Ok(new
            {
                message = "Test email sent successfully."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = "Failed to send test email.",
                error = ex.Message
            });
        }
    }
}