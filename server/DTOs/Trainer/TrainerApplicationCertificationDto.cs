namespace server.DTOs.Trainer;

public record TrainerApplicationCertificationDto(
    Guid Id,
    string Name,
    string? IssuingOrganization,
    DateOnly? IssuedDate,
    DateOnly? ExpirationDate,
    string? CertificateUrl
);