namespace server.DTOs.Training.LearningMaterials;

public class CreateLearningModuleRequest
{
    public Guid LearningMaterialId { get; set; }

    public int ModuleNumber { get; set; }

    public string Title { get; set; } = default!;

    public string? Description { get; set; }

    public int DisplayOrder { get; set; }
}