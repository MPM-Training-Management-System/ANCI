namespace server.DTOs.Reports;

public class EnrollmentReportDto
{
    public int TotalEnrollments { get; set; }

    public int ApprovedEnrollments { get; set; }

    public int PendingEnrollments { get; set; }

    public int RejectedEnrollments { get; set; }

    public PagedReportResultDto<EnrollmentReportItemDto>
        Results { get; set; } = new();
}

public class EnrollmentReportItemDto
{
    public Guid EnrollmentId { get; set; }

    public Guid ParticipantId { get; set; }

    public string ParticipantCode { get; set; } = string.Empty;

    public string ParticipantName { get; set; } = string.Empty;

    public string ParticipantEmail { get; set; } = string.Empty;

    public string TrainingProgramName { get; set; } = string.Empty;

    public Guid TrainingBatchId { get; set; }

    public string BatchCode { get; set; } = string.Empty;

    public string? TrainerName { get; set; }

    public string EnrollmentStatus { get; set; } = string.Empty;

    public DateTime EnrolledAt { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public string? ReviewRemarks { get; set; }
}