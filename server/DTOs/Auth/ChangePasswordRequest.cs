using System.ComponentModel.DataAnnotations;

namespace server.DTOs.Auth;

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string NewPassword { get; set; } = string.Empty;

    [Required]
    [Compare(
        nameof(NewPassword),
        ErrorMessage = "Passwords do not match."
    )]
    public string ConfirmPassword { get; set; } = string.Empty;
}