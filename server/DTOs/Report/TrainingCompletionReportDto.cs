namespace server.DTOs.Reports;

public class TrainingCompletionReportDto
{
    public int TotalParticipants { get; set; }

    public int CompletedParticipants { get; set; }

    public int IncompleteParticipants { get; set; }

    public decimal CompletionRate { get; set; }

    public PagedReportResultDto<TrainingCompletionReportItemDto> Results { get; set; } = new();
}

public class TrainingCompletionReportItemDto
{
    public Guid ParticipantId { get; set; }

    public string ParticipantName { get; set; } = string.Empty;

    public string? ParticipantCode { get; set; }

    public string TrainingProgramName { get; set; } = string.Empty;

    public string BatchCode { get; set; } = string.Empty;

    public Guid TrainingBatchId { get; set; }

    public string? TrainerName { get; set; }

    // TrainingBatch uses DateTime
    public DateTime TrainingStartDate { get; set; }

    public DateTime TrainingEndDate { get; set; }

    // Attendance percentage
    public decimal AttendanceRate { get; set; }

    // Assessment score
    public decimal? AssessmentScore { get; set; }

    public string AssessmentStatus { get; set; } = "Not Taken";

    public string CompletionStatus { get; set; } = "Incomplete";

    public DateTime? CompletedAt { get; set; }

    public string? CertificateNumber { get; set; }

    public bool HasCertificate { get; set; }
}