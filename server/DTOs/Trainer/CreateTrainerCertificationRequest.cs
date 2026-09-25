namespace server.DTOs.Trainer;

public record CreateTrainerCertificationRequest(
    string Name,
    string? IssuingOrganization,
    DateOnly? IssuedDate,
    DateOnly? ExpirationDate,
    string? CertificateUrl
);