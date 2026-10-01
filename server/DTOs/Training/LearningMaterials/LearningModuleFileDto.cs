namespace server.DTOs.Trainer.Learning;

public class LearningModuleFileDto
{
    public Guid Id { get; set; }

    public Guid LearningModuleId { get; set; }

    public string FileUrl { get; set; } = default!;

    public string? FileName { get; set; }

    public string? ContentType { get; set; }

    public long FileSize { get; set; }

    public string? ExtractedText { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}