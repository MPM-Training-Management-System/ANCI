namespace server.Models.Training;

public class TrainingProgramRequirement
{
    public Guid Id { get; set; }

    public Guid TrainingProgramId { get; set; }

    public string Name { get; set; } = default!;

    public string? Description { get; set; }

    public bool IsRequired { get; set; }

    public int DisplayOrder { get; set; }

    public TrainingProgram TrainingProgram { get; set; } = default!;
}