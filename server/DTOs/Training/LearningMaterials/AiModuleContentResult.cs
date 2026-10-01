namespace server.DTOs.Training.LearningMaterials;

public class AiModuleContentResult
{
    public string Welcome { get; set; } = string.Empty;

    public List<string> LearningObjectives { get; set; } = [];

    public List<AiModuleSectionResult> Sections { get; set; } = [];

    public string Summary { get; set; } = string.Empty;

    public List<string> KeyTakeaways { get; set; } = [];
}

public class AiModuleSectionResult
{
    public int SectionNumber { get; set; }

    public string Title { get; set; } = string.Empty;

    public string ContentType { get; set; } = "Text";

    public string Content { get; set; } = string.Empty;

    public List<AiSectionMediaResult> Media { get; set; } = [];
}

public class AiSectionMediaResult
{
    public string Type { get; set; } = string.Empty;

    public string Url { get; set; } = string.Empty;

    public string? Caption { get; set; }

    public int SourceIndex { get; set; }
}