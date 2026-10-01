using Microsoft.AspNetCore.Http;

namespace server.DTOs.Trainer.Learning;

public class UploadLearningModuleFileDto
{
    public IFormFile File { get; set; } = default!;
}