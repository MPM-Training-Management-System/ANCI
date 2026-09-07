namespace server.Models.Learning;

public class LearningModule
{
    public Guid Id { get; set; }

    public Guid LearningMaterialId { get; set; }

    public int ModuleNumber { get; set; }

    public string Title { get; set; } = default!;

    public string? Description { get; set; }

    public int DisplayOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // Relationships
    public LearningMaterial LearningMaterial { get; set; } = default!;

    public ICollection<LearningSection> Sections { get; set; } = [];
}