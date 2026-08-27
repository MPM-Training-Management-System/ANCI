using System.ComponentModel.DataAnnotations;

namespace server.DTOs.Trainer;

public class UpdateTrainerApplicationRequest
{
    [Required]
    [StringLength(150, MinimumLength = 2)]
    public string Specialization { get; set; } = string.Empty;

    [Range(0, 100)]
    public int? YearsOfExperience { get; set; }

    [StringLength(150)]
    public string? CertificationName { get; set; }

    [StringLength(100)]
    public string? CertificationNumber { get; set; }
}