using System.ComponentModel.DataAnnotations;
namespace server.DTOs.Assessments;

public class EvaluatePracticalAssessmentRequest
{
    [Required]
    public Guid PracticalAssessmentId { get; set; }

    [Required]
    public Guid EnrollmentId { get; set; }

    [MaxLength(2000)]
    public string? TrainerRemarks { get; set; }

    public List<PracticalAssessmentCriterionScoreRequest> CriterionScores { get; set; }
        = new();
}