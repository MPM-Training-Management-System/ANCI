namespace server.DTOs.Trainer;

public record CreateTrainerProfileRequest(
    string? FirstName,
    string? MiddleName,
    string? LastName,
    string? Suffix,
    DateOnly? BirthDate,
    string? Gender,
    string? MobileNumber,
    string? Address,

    string Specialization,
    string? ProfessionalTitle,
    string? CurrentOrganization,
    string? Bio,
    int? YearsOfExperience,

    string? ProfessionalLicenseNumber,
    string? ProfessionalLicenseType,
    DateOnly? ProfessionalLicenseExpirationDate
);