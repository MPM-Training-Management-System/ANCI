public record CreateTrainerApplicationCertificationRequest(
    string Name,
    string? IssuingOrganization,
    DateOnly? IssuedDate,
    DateOnly? ExpirationDate
);