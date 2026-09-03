using Microsoft.AspNetCore.Http;

namespace server.DTOs.Trainer;

public class RegisterTrainerRequest
{
    // =========================================================
    // PERSONAL INFORMATION
    // =========================================================

    public string FirstName { get; set; }
        = string.Empty;

    public string? MiddleName { get; set; }

    public string LastName { get; set; }
        = string.Empty;

    public DateOnly? BirthDate { get; set; }

    // Complete address coming from frontend.
    // Example:
    // 123, Rizal Street, Sitio 2,
    // Barangay San Jose, Rodriguez, Rizal
    public string Address { get; set; }
        = string.Empty;

    public string Gender { get; set; }
        = string.Empty;


    // =========================================================
    // ACCOUNT INFORMATION
    // =========================================================

    public string Email { get; set; }
        = string.Empty;

    public string? MobileNumber { get; set; }

    public string Password { get; set; }
        = string.Empty;


    // =========================================================
    // TRAINER INFORMATION
    // =========================================================

    public string Specialization { get; set; }
        = string.Empty;

    public string? Bio { get; set; }

    public int? YearsOfExperience { get; set; }

    public string? CertificationName { get; set; }

    public string? CertificationNumber { get; set; }


    // =========================================================
    // PROFILE IMAGE
    // =========================================================

    public IFormFile? ProfileImage { get; set; }
}