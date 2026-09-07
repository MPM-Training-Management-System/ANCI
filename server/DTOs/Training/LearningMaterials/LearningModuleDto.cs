namespace server.DTOs.Training.LearningMaterials;

public class LearningModuleDto
{
    public Guid Id { get; set; }

    public Guid LearningMaterialId { get; set; }

    public int ModuleNumber { get; set; }

    public string Title { get; set; } = default!;

    public string? Description { get; set; }

    public int DisplayOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int SectionCount { get; set; }
}