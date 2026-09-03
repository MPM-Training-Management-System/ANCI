namespace server.DTOs.Training;

public record TrainerAssignmentDto(
    Guid Id,
    Guid TrainerProfileId,
    Guid TrainingBatchId,
    string TrainerName,
    string BatchCode,
    DateTime AssignedAt,
    bool IsActive
);