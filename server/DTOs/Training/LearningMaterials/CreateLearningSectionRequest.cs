namespace server.DTOs.Training.LearningMaterials;

public class CreateLearningSectionRequest
{
    public Guid LearningModuleId { get; set; }

    public int SectionNumber { get; set; }

    public string Title { get; set; } = default!;

    public string ContentType { get; set; } = "Text";

    public string? Content { get; set; }

    public string? MediaUrl { get; set; }

    public int DisplayOrder { get; set; }
}