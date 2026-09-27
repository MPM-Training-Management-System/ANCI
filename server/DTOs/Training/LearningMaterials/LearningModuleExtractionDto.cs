namespace server.DTOs.Trainer.Learning;

public class LearningModuleExtractionDto
{
    public Guid LearningModuleId { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string? ContentType { get; set; }

    public string Text { get; set; } = string.Empty;

    public int CharacterCount { get; set; }

    public int PageCount { get; set; }
}