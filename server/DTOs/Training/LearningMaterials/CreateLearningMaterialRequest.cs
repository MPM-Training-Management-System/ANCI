namespace server.DTOs.Training.LearningMaterials;

public class CreateLearningMaterialRequest
{
    public Guid TrainingBatchId { get; set; }

    public string Title { get; set; } = default!;

    public string? Description { get; set; }

    public string MaterialType { get; set; } = default!;
}