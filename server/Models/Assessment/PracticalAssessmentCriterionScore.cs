namespace server.Models.Assessment;

public class PracticalAssessmentCriterionScore
{
    public Guid Id { get; set; }

    public Guid PracticalAssessmentResultId { get; set; }

    public Guid PracticalAssessmentCriterionId { get; set; }

    public decimal Score { get; set; }

    public PracticalAssessmentResult PracticalAssessmentResult { get; set; }
        = null!;

    public PracticalAssessmentCriterion PracticalAssessmentCriterion { get; set; }
        = null!;
}