namespace server.DTOs.Trainer;

public record TrainerProfileDto(
    Guid Id,

    Guid UserId,

    string UserCode,

    string FullName,

    string Email,

    string? MobileNumber,

    string? FirstName,

    string? MiddleName,

    string? LastName,

    DateOnly? BirthDate,

    string? Address,

    string? Gender,

    bool IsActive,

    string Specialization,

    string? Bio,

    int? YearsOfExperience,

    string? ProfileImageUrl,

    DateTime? ActivatedAt
);