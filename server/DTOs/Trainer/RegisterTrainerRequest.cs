using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace server.DTOs.Auth;

public class RegisterTrainerRequest
{
    [Required]
    [StringLength(150, MinimumLength = 2)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(255)]
    public string Email { get; set; } = string.Empty;

    [Phone]
    [StringLength(30)]
    public string? MobileNumber { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [StringLength(150, MinimumLength = 2)]
    public string Specialization { get; set; } = string.Empty;

    [Range(0, 100)]
    public int? YearsOfExperience { get; set; }

    [StringLength(150)]
    public string? CertificationName { get; set; }

    [StringLength(150)]
    public string? CertificationNumber { get; set; }

    public IFormFile? ProfileImage { get; set; }
}