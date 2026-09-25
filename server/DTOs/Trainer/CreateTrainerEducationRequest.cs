namespace server.DTOs.Trainer;

public record CreateTrainerEducationRequest(
    string Degree,
    string? FieldOfStudy,
    string Institution,
    int? YearGraduated
);