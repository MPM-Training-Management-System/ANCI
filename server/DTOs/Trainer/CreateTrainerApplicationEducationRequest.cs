public record CreateTrainerApplicationEducationRequest(
    string Degree,
    string? FieldOfStudy,
    string Institution,
    int? YearGraduated
);