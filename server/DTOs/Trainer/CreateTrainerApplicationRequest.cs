namespace server.DTOs.Trainer;

public record CreateTrainerApplicationRequest(
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
    DateOnly? ProfessionalLicenseExpirationDate
);