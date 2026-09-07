namespace server.DTOs.Training.LearningMaterials;

public class LearningMaterialDto
{
    public Guid Id { get; set; }

    public Guid TrainingBatchId { get; set; }

    public string BatchCode { get; set; } = default!;

    public string Title { get; set; } = default!;

    public string? Description { get; set; }

    public string MaterialType { get; set; } = default!;

    public string FileUrl { get; set; } = default!;

    public string? FileName { get; set; }

    public string? ContentType { get; set; }

    public long? FileSize { get; set; }

    public bool IsPublished { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}