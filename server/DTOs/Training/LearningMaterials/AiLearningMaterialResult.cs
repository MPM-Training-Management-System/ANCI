namespace server.DTOs.Training.LearningMaterials;

public class AiLearningMaterialResult
{
    public List<AiLearningModuleResult> Modules { get; set; } = [];
}

public class AiLearningModuleResult
{
    public int ModuleNumber { get; set; }

    public string Title { get; set; } = default!;

    public string? Description { get; set; }

    public List<AiLearningSectionResult> Sections { get; set; } = [];
}

public class AiLearningSectionResult
{
    public int SectionNumber { get; set; }

    public string Title { get; set; } = default!;

    public string ContentType { get; set; } = "Text";

    public string Content { get; set; } = default!;

    public string? MediaUrl { get; set; }
}