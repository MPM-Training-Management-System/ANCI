namespace server.Models.Learning;

public class LearningModule
{
    public Guid Id { get; set; }

    public Guid LearningMaterialId { get; set; }

    public int ModuleNumber { get; set; }

    public string Title { get; set; } = default!;

    public string? Description { get; set; }

    // AI-generated support content
    public string? WelcomeContent { get; set; }

    public string? LearningObjectives { get; set; }

    public string? Summary { get; set; }

    public string? KeyTakeaways { get; set; }

    public int DisplayOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public LearningMaterial LearningMaterial { get; set; } = default!;

    public ICollection<LearningModuleFile> Files { get; set; } = [];

    public ICollection<LearningModuleChunk> Chunks { get; set; } = [];

    public ICollection<LearningSection> Sections { get; set; } = [];
}