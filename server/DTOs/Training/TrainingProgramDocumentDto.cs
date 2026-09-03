namespace server.DTOs.Training;

public record TrainingProgramDocumentDto(
    Guid Id,
    Guid TrainingProgramId,
    string DocumentName,
    string FileUrl,
    DateTime UploadedAt
);