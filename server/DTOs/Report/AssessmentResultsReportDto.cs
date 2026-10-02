namespace server.DTOs.Reports;

public class AssessmentResultsReportDto
{
    public int TotalAttempts { get; set; }

    public int PassedAttempts { get; set; }

    public int FailedAttempts { get; set; }

    public int PendingAttempts { get; set; }

    public decimal AverageScore { get; set; }

    public decimal PassRate { get; set; }

    public PagedReportResultDto<AssessmentResultsReportItemDto> Results { get; set; } = new();
}

public class AssessmentResultsReportItemDto
{
    public Guid AssessmentAttemptId { get; set; }

    public Guid AssessmentId { get; set; }

    public string AssessmentTitle { get; set; } = string.Empty;

    public Guid EnrollmentId { get; set; }

    public Guid ParticipantId { get; set; }

    public string ParticipantCode { get; set; } = string.Empty;

    public string ParticipantName { get; set; } = string.Empty;

    public string ParticipantEmail { get; set; } = string.Empty;

    public string TrainingProgramName { get; set; } = string.Empty;

    public Guid TrainingBatchId { get; set; }

    public string BatchCode { get; set; } = string.Empty;

    public string? TrainerName { get; set; }

    public int AttemptNumber { get; set; }

    public int TotalQuestions { get; set; }

    public int CorrectAnswers { get; set; }

    public int TotalPoints { get; set; }

    public int EarnedPoints { get; set; }

    public decimal Percentage { get; set; }

    public bool IsPassed { get; set; }

    public string AssessmentStatus { get; set; } = string.Empty;

    public DateTime StartedAt { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public DateTime? EvaluatedAt { get; set; }
}