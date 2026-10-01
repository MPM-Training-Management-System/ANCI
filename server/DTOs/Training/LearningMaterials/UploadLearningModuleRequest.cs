using Microsoft.AspNetCore.Http;

namespace server.DTOs.Training.LearningMaterials;

public class UploadLearningModuleRequest
{
    public IFormFile File { get; set; } = null!;
}