namespace server.DTOs.Training;


public record TrainingBatchTrainerDto(
    Guid TrainerProfileId,
    Guid UserId,
    string FullName,
    string UserCode,
    string Email,
    string? ProfileImageUrl
);
public record TrainingBatchDto(
    Guid Id,
    string ProgramName,
    string BatchCode,
    string? Location,
    DateTime StartDate,
    DateTime EndDate,
    int Capacity,
    int EnrolledCount,
    string Status,
    TrainingBatchTrainerDto? Trainer
);