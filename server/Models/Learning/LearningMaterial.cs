namespace server.Models.Learning;
using server.Models.Training;
public class LearningMaterial
{
    public Guid Id { get; set; }

    public Guid TrainingBatchId { get; set; }

    public string Title { get; set; } = default!;

    public string? Description { get; set; }

    public string MaterialType { get; set; } = default!;

    // Original uploaded file
    public string FileUrl { get; set; } = default!;

    public string? PublicId { get; set; }

    public string? FileName { get; set; }

    public string? ContentType { get; set; }

    public long? FileSize { get; set; }

    // Draft / Published
    public bool IsPublished { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // Relationships
    public TrainingBatch TrainingBatch { get; set; } = default!;

    public ICollection<LearningModule> Modules { get; set; } = [];
}