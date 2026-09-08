using server.Models.Training;

namespace server.Models.Assessment;

public class WrittenAssessment
{
    public Guid Id { get; set; }

    public Guid TrainingBatchId { get; set; }

    public string Title { get; set; } = default!;

    public string? Description { get; set; }

    public int PassingPercentage { get; set; }

    public bool IsPublished { get; set; }

     public string? SourceFileUrl { get; set; }

    public string? SourcePublicId { get; set; }

    public string? SourceFileName { get; set; }

    public string? SourceContentType { get; set; }

    public long? SourceFileSize { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public TrainingBatch TrainingBatch { get; set; } = default!;

    public ICollection<AssessmentQuestion> Questions { get; set; } = [];

    public ICollection<AssessmentAttempt> Attempts { get; set; } = [];
}