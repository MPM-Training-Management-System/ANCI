namespace server.DTOs.Trainer;

public record TrainerApplicationEducationDto(
    Guid Id,
    string Degree,
    string? FieldOfStudy,
    string Institution,
    int? YearGraduated
);