namespace server.DTOs.Assessments;

public class PracticalAssessmentCriterionScoreDto
{
    public Guid CriterionId { get; set; }

    public string CriterionName { get; set; } = string.Empty;

    public decimal WeightPercentage { get; set; }

    public decimal Score { get; set; }

    public decimal WeightedScore { get; set; }
}