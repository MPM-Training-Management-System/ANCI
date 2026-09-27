namespace server.DTOs.Training.LearningMaterials;

public class UpdateLearningModuleRequest
{
    public int ModuleNumber { get; set; }

    public string Title { get; set; } = default!;

    public string? Description { get; set; }

    // AI-generated content
    public string? WelcomeContent { get; set; }

    public List<string>? LearningObjectives { get; set; }

    public string? Summary { get; set; }

    public List<string>? KeyTakeaways { get; set; }

    public int DisplayOrder { get; set; }
}