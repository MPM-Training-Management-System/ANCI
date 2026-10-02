namespace server.DTOs.Trainer;

public class CreateTrainerReportRequestDto
{
    public Guid TrainingBatchId { get; set; }

    public string ReportType { get; set; } = string.Empty;

    public DateTime? DateFrom { get; set; }

    public DateTime? DateTo { get; set; }

    public string? Reason { get; set; }
}

public class TrainerReportRequestDto
{
    public Guid Id { get; set; }

    public Guid TrainingBatchId { get; set; }

    public string BatchCode { get; set; } = string.Empty;

    public string TrainingProgramName { get; set; } = string.Empty;

    public string ReportType { get; set; } = string.Empty;

    public DateTime? DateFrom { get; set; }

    public DateTime? DateTo { get; set; }

    public string? Reason { get; set; }

    public string Status { get; set; } = string.Empty;

    public DateTime RequestedAt { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public string? AdminRemarks { get; set; }

    public string? ReportFileUrl { get; set; }
}