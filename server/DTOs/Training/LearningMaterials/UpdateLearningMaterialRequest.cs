namespace server.DTOs.Training.LearningMaterials;

public class UpdateLearningMaterialRequest
{
    public string Title { get; set; } = default!;

    public string? Description { get; set; }

    public string MaterialType { get; set; } = default!;
}