namespace server.DTOs.Trainer;

public record TrainerApplicationDocumentDto(
    Guid Id,
    string DocumentType,
    string FileName,
    string FileUrl,
    string Status,
    string? ReviewRemarks
);