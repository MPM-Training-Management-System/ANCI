using server.Models.Learning;
using server.Models.Training;

public class LearningMaterial
{
    public Guid Id { get; set; }
    public Guid TrainingBatchId { get; set; }

    public string Title { get; set; } = default!;
    public string? Description { get; set; }

    public string MaterialType { get; set; } = default!;

    public string FileUrl { get; set; } = default!;
    public string? PublicId { get; set; }

    public string? FileName { get; set; }
    public string? ContentType { get; set; }
    public long? FileSize { get; set; }

    // NEW
    public string? ExtractedText { get; set; }

    public bool IsPublished { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public TrainingBatch TrainingBatch { get; set; } = default!;

    public ICollection<LearningModule> Modules { get; set; } = [];
}