using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace server.DTOs.Trainer;

public class UploadTrainerApplicationDocumentRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string DocumentType { get; set; } = string.Empty;

    [Required]
    public IFormFile File { get; set; } = null!;
}