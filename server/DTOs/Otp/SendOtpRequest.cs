using System.ComponentModel.DataAnnotations;

namespace server.DTOs.Otp;

public class SendOtpRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}