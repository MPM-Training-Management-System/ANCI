using server.Enums;
using server.Models.Auth;

namespace server.Models.Trainer;

public class TrainerApplication
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

    public string? Address { get; set; }


    // =========================================================
    // PROFESSIONAL INFORMATION
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
    // APPLICATION STATUS
    // =========================================================

    public TrainerApplicationStatus Status { get; set; }
        = TrainerApplicationStatus.Pending;

    public string? AdminRemarks { get; set; }

    public Guid? ReviewedByUserId { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? SubmittedAt { get; set; }


    // =========================================================
    // RELATIONSHIPS
    // =========================================================

    public User User { get; set; }
        = default!;

    public ICollection<TrainerApplicationDocument> Documents { get; set; }
        = [];

    public ICollection<TrainerApplicationEducation> Educations { get; set; }
        = [];

    public ICollection<TrainerApplicationCertification> Certifications { get; set; }
        = [];
}