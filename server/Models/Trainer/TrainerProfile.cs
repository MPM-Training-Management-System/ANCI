using server.Models.Auth;

namespace server.Models.Trainer;

public class TrainerProfile
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }


    // =========================================================
    // PERSONAL INFORMATION
    // =========================================================

    public string? FirstName { get; set; }

    public string? MiddleName { get; set; }

    public string? LastName { get; set; }

    public string? Suffix { get; set; }

    public DateOnly? BirthDate { get; set; }

    public string? Gender { get; set; }

    public string? MobileNumber { get; set; }

    public string? Address { get; set; }


    // =========================================================
    // PROFESSIONAL / TRAINER INFORMATION
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

    public string? ProfileImageUrl { get; set; }


    // =========================================================
    // ACCOUNT / STATUS
    // =========================================================

    public bool IsActive { get; set; }

    public DateTime? ActivatedAt { get; set; }


    // =========================================================
    // EDUCATION
    // =========================================================

    public ICollection<TrainerEducation> Educations { get; set; }
        = [];


    // =========================================================
    // CERTIFICATIONS
    // =========================================================

    public ICollection<TrainerCertification> Certifications { get; set; }
        = [];


    // =========================================================
    // RELATIONSHIPS
    // =========================================================

    public User User { get; set; }
        = default!;

    public ICollection<TrainerAssignment> Assignments { get; set; }
        = [];
}