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

    public string? Suffix { get; set; }

    public DateOnly? BirthDate { get; set; }

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
    // TRAINER / PROFESSIONAL INFORMATION
    // =========================================================

    public string Specialization { get; set; }
        = string.Empty;

    public string? ProfessionalTitle { get; set; }

    public string? CurrentOrganization { get; set; }

    public string? Bio { get; set; }

    public int? YearsOfExperience { get; set; }


    // =========================================================
    // PROFESSIONAL LICENSE
    // =========================================================

    public string? ProfessionalLicenseNumber { get; set; }

    public string? ProfessionalLicenseType { get; set; }

    public DateOnly? ProfessionalLicenseExpirationDate { get; set; }


    // =========================================================
    // PROFILE IMAGE
    // =========================================================

    public IFormFile? ProfileImage { get; set; }


    // =========================================================
    // EDUCATION
    // =========================================================

    public List<CreateTrainerEducationRequest> Educations { get; set; }
        = [];


    // =========================================================
    // CERTIFICATIONS
    // =========================================================

    public List<CreateTrainerCertificationRequest> Certifications { get; set; }
        = [];
}