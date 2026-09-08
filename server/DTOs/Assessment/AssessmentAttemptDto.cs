namespace server.DTOs.Assessments;

public class StartAssessmentRequest
{
    public Guid WrittenAssessmentId { get; set; }
}

public class AssessmentAttemptDto
{
    public Guid Id { get; set; }

    public Guid WrittenAssessmentId { get; set; }

    public string AssessmentTitle { get; set; } = default!;

    public int AttemptNumber { get; set; }

    public DateTime StartedAt { get; set; }

    public AssessmentAttemptStatus Status { get; set; }

    public IReadOnlyList<AssessmentQuestionDto> Questions { get; set; } = [];
}