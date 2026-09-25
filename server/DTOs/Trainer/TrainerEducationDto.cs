namespace server.DTOs.Trainer;

public record TrainerEducationDto(
    Guid Id,
    Guid TrainerProfileId,
    string Degree,
    string? FieldOfStudy,
    string Institution,
    int? YearGraduated
);