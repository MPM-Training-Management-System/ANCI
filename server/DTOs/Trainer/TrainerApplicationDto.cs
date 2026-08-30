namespace server.DTOs.Trainer;

public record TrainerApplicationDto(
    Guid Id,

    Guid UserId,

    string UserCode,

    string FullName,

    string Email,

    string? MobileNumber,

    string Specialization,

    int? YearsOfExperience,

    string? CertificationName,

    string? CertificationNumber,

    string? ProfileImageUrl,

    string Status,

    string? AdminRemarks,

    DateTime CreatedAt,

    DateTime? SubmittedAt,

    List<TrainerApplicationDocumentDto> Documents
);