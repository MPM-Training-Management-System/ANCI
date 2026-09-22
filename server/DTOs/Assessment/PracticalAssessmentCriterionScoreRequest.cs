using System.ComponentModel.DataAnnotations;

namespace server.DTOs.Assessments;

public class PracticalAssessmentCriterionScoreRequest
{
    [Required]
    public Guid CriterionId { get; set; }

    [Range(0, 100)]
    public decimal Score { get; set; }
}