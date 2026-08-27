using System.ComponentModel.DataAnnotations;

namespace server.DTOs.Trainer;

public class UpdateTrainerProfileRequest
{
    [Required]
    [StringLength(150, MinimumLength = 2)]
    public string Specialization { get; set; }
        = string.Empty;

    [StringLength(1000)]
    public string? Bio { get; set; }

    [Range(0, 100)]
    public int? YearsOfExperience { get; set; }

    [Phone]
    [StringLength(30)]
    public string? MobileNumber { get; set; }
}