namespace server.DTOs.Assessments;

public class AssessmentResultDto
{
    public Guid Id { get; set; }

    public Guid AssessmentAttemptId { get; set; }

    public Guid WrittenAssessmentId { get; set; }

    public string AssessmentTitle { get; set; } = default!;

    public int AttemptNumber { get; set; }

    public int TotalQuestions { get; set; }

    public int CorrectAnswers { get; set; }

    public int TotalPoints { get; set; }

    public int EarnedPoints { get; set; }

    public decimal Percentage { get; set; }

    public bool IsPassed { get; set; }

    public DateTime EvaluatedAt { get; set; }
}