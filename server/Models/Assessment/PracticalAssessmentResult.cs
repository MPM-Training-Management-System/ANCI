using System.ComponentModel.DataAnnotations;
using server.Models.Participant;

namespace server.Models.Assessment;

public class PracticalAssessmentResult
{
    public Guid Id { get; set; }

    public Guid PracticalAssessmentId { get; set; }

    public Guid EnrollmentId { get; set; }

    public decimal TotalScore { get; set; }

    public decimal Percentage { get; set; }

    public bool IsPassed { get; set; }

    [MaxLength(2000)]
    public string? TrainerRemarks { get; set; }

    public Guid EvaluatedByUserId { get; set; }

    public DateTime EvaluatedAt { get; set; } = DateTime.UtcNow;

    public PracticalAssessment PracticalAssessment { get; set; }
        = null!;

    public Enrollment Enrollment { get; set; }
        = null!;

    public ICollection<PracticalAssessmentCriterionScore> CriterionScores { get; set; }
        = new List<PracticalAssessmentCriterionScore>();
}