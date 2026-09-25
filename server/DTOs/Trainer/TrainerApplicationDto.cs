namespace server.DTOs.Trainer;

public record TrainerApplicationDto(
    Guid Id,
    Guid UserId,

    // User
    string UserCode,
    string FullName,
    string Email,
    string? MobileNumber,

    // Personal
    string? FirstName,
    string? MiddleName,
    string? LastName,
    string? Suffix,
    DateOnly? BirthDate,
    string? Gender,
    string? Address,

    // Professional
    string Specialization,
    string? ProfessionalTitle,
    string? CurrentOrganization,
    string? Bio,
    int? YearsOfExperience,

    // License
    string? ProfessionalLicenseNumber,
    string? ProfessionalLicenseType,
    DateOnly? ProfessionalLicenseExpirationDate,

    // Profile
    string? ProfileImageUrl,

    // Status
    string Status,
    string? AdminRemarks,

    DateTime CreatedAt,
    DateTime? SubmittedAt,

    // Education
    IReadOnlyList<TrainerApplicationEducationDto> Educations,

    // Certifications
    IReadOnlyList<TrainerApplicationCertificationDto> Certifications,

    // Documents
    IReadOnlyList<TrainerApplicationDocumentDto> Documents
);