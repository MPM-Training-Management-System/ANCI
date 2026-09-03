namespace server.DTOs.Training;

public record CreateTrainingBatchRequest(
    Guid TrainingProgramId,
    string BatchCode,
    string? Location,
    DateTime StartDate,
    DateTime EndDate,
    TimeOnly? StartTime,
    TimeOnly? EndTime,
    int Capacity
);