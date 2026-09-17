using System.ComponentModel.DataAnnotations;

namespace server.DTOs.Auth;

public class VerifyResetOtpRequest
{
    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(6, MinimumLength = 6)]
    public string OtpCode { get; set; } = string.Empty;
}