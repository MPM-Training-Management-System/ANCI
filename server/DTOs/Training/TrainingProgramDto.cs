namespace server.DTOs.Training;

public record TrainingProgramRequirementDto(
    Guid Id,
    string Name,
    string? Description,
    bool IsRequired,
    int DisplayOrder
);

public record TrainingProgramDto(
    Guid Id,
    string ProgramCode,
    string Name,
    string? Description,
    int DurationHours,
    bool IsActive,
    DateTime CreatedAt,
    List<TrainingProgramRequirementDto> Requirements
);