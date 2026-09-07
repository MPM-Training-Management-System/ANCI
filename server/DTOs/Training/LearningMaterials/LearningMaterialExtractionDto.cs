namespace server.DTOs.Training.LearningMaterials;

public class LearningMaterialExtractionDto
{
    public Guid LearningMaterialId { get; set; }

    public string FileName { get; set; } = default!;

    public string? ContentType { get; set; }

    public string Text { get; set; } = string.Empty;

    public int CharacterCount { get; set; }

    public int PageCount { get; set; }
}