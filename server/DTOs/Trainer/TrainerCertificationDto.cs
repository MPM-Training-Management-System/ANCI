namespace server.DTOs.Trainer;

public record TrainerCertificationDto(
    Guid Id,
    Guid TrainerProfileId,
    string Name,
    string? IssuingOrganization,
    DateOnly? IssuedDate,
    DateOnly? ExpirationDate,
    string? CertificateUrl
);