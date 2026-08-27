using System.ComponentModel.DataAnnotations;

namespace server.DTOs.Trainer;

public class ReviewTrainerApplicationRequest
{
    [Required]
    public string Decision { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Remarks { get; set; }
}