namespace server.DTOs.Training.LearningMaterials;

public class LearningModuleDto
{
    public Guid Id { get; set; }

    public Guid LearningMaterialId { get; set; }

    public int ModuleNumber { get; set; }

    public string Title { get; set; } = default!;

    public string? Description { get; set; }

    public string? FileUrl { get; set; }

public string? FileName { get; set; }

public string? ContentType { get; set; }

public long? FileSize { get; set; }

public string? ExtractedText { get; set; }
    // =========================================================
    // AI-GENERATED LEARNING CONTENT
    // =========================================================

    public string? WelcomeContent { get; set; }

    public List<string> LearningObjectives { get; set; } = [];

    public string? Summary { get; set; }

    public List<string> KeyTakeaways { get; set; } = [];

    // =========================================================
    // MODULE ORDER
    // =========================================================

    public int DisplayOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int SectionCount { get; set; }
}