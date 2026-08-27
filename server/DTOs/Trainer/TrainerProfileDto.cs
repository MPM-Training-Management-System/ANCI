namespace server.DTOs.Trainer;

public record TrainerProfileDto(
    Guid Id,
    Guid UserId,
    string UserCode,
    string FullName,
    string Email,
    string? MobileNumber,
    string Specialization,
    string? Bio,
    int? YearsOfExperience,
    string? ProfileImageUrl,
    bool IsActive,
    DateTime ActivatedAt
);