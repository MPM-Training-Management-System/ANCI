namespace server.DTOs.Trainer;

public record TrainerProfileDto(
    Guid Id,
    Guid UserId,

    // =========================================================
    // USER INFORMATION
    // =========================================================

    string UserCode,
    string FullName,
    string Email,

    // =========================================================
    // PERSONAL INFORMATION
    // =========================================================

    string? FirstName,
    string? MiddleName,
    string? LastName,
    string? Suffix,
    DateOnly? BirthDate,
    string? Gender,
    string? MobileNumber,
    string? Address,

    // =========================================================
    // PROFESSIONAL / TRAINER INFORMATION
    // =========================================================

    string Specialization,
    string? ProfessionalTitle,
    string? CurrentOrganization,
    string? Bio,
    int? YearsOfExperience,

    // =========================================================
    // PROFESSIONAL LICENSE
    // =========================================================

    string? ProfessionalLicenseNumber,
    string? ProfessionalLicenseType,
    DateOnly? ProfessionalLicenseExpirationDate,

    // =========================================================
    // EDUCATION
    // =========================================================

    IReadOnlyList<TrainerEducationDto> Educations,

    // =========================================================
    // CERTIFICATIONS
    // =========================================================

    IReadOnlyList<TrainerCertificationDto> Certifications,

    // =========================================================
    // PROFILE
    // =========================================================

    string? ProfileImageUrl,

    // =========================================================
    // STATUS
    // =========================================================

    bool IsActive,
    DateTime? ActivatedAt
);