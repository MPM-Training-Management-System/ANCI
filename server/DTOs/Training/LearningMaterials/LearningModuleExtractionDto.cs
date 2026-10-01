namespace server.DTOs.Trainer.Learning;

public class LearningModuleFileExtractionDto
{
    public Guid LearningModuleFileId { get; set; }

    public Guid LearningModuleId { get; set; }

    public string? FileName { get; set; }

    public string? ContentType { get; set; }

    public string Text { get; set; } = string.Empty;

    public int CharacterCount { get; set; }

    public int PageCount { get; set; }
}