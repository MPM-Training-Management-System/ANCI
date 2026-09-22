namespace server.DTOs.Assessments;

public class PracticalAssessmentResultDto
{
    public Guid Id { get; set; }

    public Guid PracticalAssessmentId { get; set; }

    public Guid EnrollmentId { get; set; }

    public string ParticipantName { get; set; } = string.Empty;

    public string AssessmentTitle { get; set; } = string.Empty;

    public decimal TotalScore { get; set; }

    public decimal Percentage { get; set; }

    public bool IsPassed { get; set; }

    public string? TrainerRemarks { get; set; }

    public Guid EvaluatedByUserId { get; set; }

    public DateTime EvaluatedAt { get; set; }

    public List<PracticalAssessmentCriterionScoreDto> CriterionScores { get; set; }
        = new();
}