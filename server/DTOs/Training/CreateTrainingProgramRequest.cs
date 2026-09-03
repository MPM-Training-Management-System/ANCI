namespace server.DTOs.Training;

public record CreateTrainingProgramRequirementRequest(
    string Name,
    string? Description,
    bool IsRequired,
    int DisplayOrder
);

public record CreateTrainingProgramRequest(
    string ProgramCode,
    string Name,
    string Description,
    int DurationHours,
    List<CreateTrainingProgramRequirementRequest> Requirements
);

public record UpdateTrainingProgramRequest(
    string ProgramCode,
    string Name,
    string? Description,
    int DurationHours,
    List<CreateTrainingProgramRequirementRequest>? Requirements
);