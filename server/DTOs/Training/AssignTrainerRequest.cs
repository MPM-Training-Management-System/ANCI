namespace server.DTOs.Training;

public record AssignTrainerRequest(
    Guid TrainerProfileId,
    Guid TrainingBatchId
);