using System.ComponentModel.DataAnnotations;

namespace server.DTOs.Assessments;

public class CreatePracticalAssessmentCriterionRequest
{
    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [Range(0, 100)]
    public decimal WeightPercentage { get; set; }

    [Range(1, int.MaxValue)]
    public int DisplayOrder { get; set; }
}