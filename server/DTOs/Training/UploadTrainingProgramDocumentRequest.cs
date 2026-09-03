using Microsoft.AspNetCore.Http;

namespace server.DTOs.Training;

public class UploadTrainingProgramDocumentRequest
{
    
    public IFormFile File { get; set; } = null!;

    
}