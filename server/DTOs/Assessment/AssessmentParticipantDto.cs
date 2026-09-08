namespace server.DTOs.Assessments;

public class ParticipantAssessmentDto
{
    public Guid Id { get; set; }

    public Guid TrainingBatchId { get; set; }

    public string BatchCode { get; set; } = default!;

    public string Title { get; set; } = default!;

    public string? Description { get; set; }

    public int PassingPercentage { get; set; }

    public int QuestionCount { get; set; }

    public bool IsPublished { get; set; }

    public int AttemptCount { get; set; }

    public bool HasPassed { get; set; }

    public decimal? LatestPercentage { get; set; }
}