namespace server.Models.Learning;

public class LearningModuleFile
{
    public Guid Id { get; set; }

    public Guid LearningModuleId { get; set; }

    public string FileUrl { get; set; } = default!;

    public string? PublicId { get; set; }

    public string FileName { get; set; } = default!;

    public string? ContentType { get; set; }

    public long FileSize { get; set; }

    public string? ExtractedText { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // Relationships
    public LearningModule LearningModule { get; set; } = default!;

    public ICollection<LearningModuleChunk> Chunks { get; set; } = [];
}