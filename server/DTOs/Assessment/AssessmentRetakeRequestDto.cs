namespace server.DTOs.Assessments;

public class AssessmentRetakeRequestDto
{
    public Guid Id { get; set; }

    public Guid ParticipantId { get; set; }

    public Guid WrittenAssessmentId { get; set; }

    public Guid PreviousAttemptId { get; set; }

    public string AssessmentTitle { get; set; } = string.Empty;

    public int AttemptNumber { get; set; }

    public decimal Percentage { get; set; }

    public bool IsPassed { get; set; }

    public string? Reason { get; set; }

    public string Status { get; set; } = string.Empty;

    public DateTime RequestedAt { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public string? AdminRemarks { get; set; }
}