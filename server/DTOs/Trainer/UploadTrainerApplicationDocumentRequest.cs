using Microsoft.AspNetCore.Http;

namespace server.DTOs.Trainer;

public class UploadTrainerApplicationDocumentRequest
{
    public string DocumentType { get; set; }
        = string.Empty;

    public IFormFile File { get; set; }
        = default!;
}