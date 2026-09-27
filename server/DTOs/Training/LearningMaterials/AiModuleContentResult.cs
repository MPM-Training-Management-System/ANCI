namespace server.DTOs.Training.LearningMaterials;

public class AiModuleContentResult
{
    public string Welcome { get; set; } = string.Empty;

    public List<string> LearningObjectives { get; set; } = [];

    public string Summary { get; set; } = string.Empty;

    public List<string> KeyTakeaways { get; set; } = [];
}