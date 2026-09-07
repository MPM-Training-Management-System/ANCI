namespace server.DTOs.Training.LearningMaterials;

public class UploadLearningMaterialRequest
{
    public IFormFile File { get; set; } = default!;
}