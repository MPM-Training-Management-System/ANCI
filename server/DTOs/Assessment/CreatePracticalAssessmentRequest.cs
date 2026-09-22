using System.ComponentModel.DataAnnotations;


namespace server.DTOs.Assessments;

public class CreatePracticalAssessmentRequest
{
    [Required]
    public Guid TrainingBatchId { get; set; }

    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Range(0, 100)]
    public decimal PassingPercentage { get; set; } = 75;

    public List<CreatePracticalAssessmentCriterionRequest> Criteria { get; set; }
        = new();
}