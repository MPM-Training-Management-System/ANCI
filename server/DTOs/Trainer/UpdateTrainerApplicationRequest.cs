namespace server.DTOs.Trainer;

public record UpdateTrainerApplicationRequest(
    // =========================================================
    // PERSONAL INFORMATION
    // =========================================================

    string? FirstName,
    string? MiddleName,
    string? LastName,
    string? Suffix,

    DateOnly? BirthDate,

    string? Gender,
    string? Address,


    // =========================================================
    // PROFESSIONAL INFORMATION
    // =========================================================

    string? Specialization,
    string? ProfessionalTitle,
    string? CurrentOrganization,
    string? Bio,
    int? YearsOfExperience,


    // =========================================================
    // PROFESSIONAL LICENSE
    // =========================================================

    string? ProfessionalLicenseNumber,
    string? ProfessionalLicenseType,
    DateOnly? ProfessionalLicenseExpirationDate
);