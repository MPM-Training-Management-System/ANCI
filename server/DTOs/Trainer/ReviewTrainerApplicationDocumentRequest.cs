using System.ComponentModel.DataAnnotations;

namespace server.DTOs.Trainer;

public class ReviewTrainerApplicationDocumentRequest
{
    [Required]
    public string Decision { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Remarks { get; set; }
}