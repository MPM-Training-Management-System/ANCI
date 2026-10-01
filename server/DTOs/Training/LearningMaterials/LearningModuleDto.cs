namespace server.DTOs.Trainer.Learning;

public class LearningModuleDto
{
    public Guid Id { get; set; }

    public Guid LearningMaterialId { get; set; }

    public int ModuleNumber { get; set; }

    public string Title { get; set; } = default!;

    public string? Description { get; set; }

    public List<LearningModuleFileDto> Files { get; set; } = [];

    public string? WelcomeContent { get; set; }

    public List<string> LearningObjectives { get; set; } = [];

    public string? Summary { get; set; }

    public List<string> KeyTakeaways { get; set; } = [];

    public int DisplayOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int SectionCount { get; set; }
}