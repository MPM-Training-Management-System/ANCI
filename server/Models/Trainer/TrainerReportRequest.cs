using server.Models.Auth;
using server.Models.Training;

namespace server.Models.Trainer;

public class TrainerReportRequest
{
    public Guid Id { get; set; }

    public Guid TrainerProfileId { get; set; }

    public Guid TrainingBatchId { get; set; }

    public string ReportType { get; set; } = string.Empty;

    public DateTime? DateFrom { get; set; }

    public DateTime? DateTo { get; set; }

    public string? Reason { get; set; }

    public TrainerReportRequestStatus Status { get; set; }
        = TrainerReportRequestStatus.Pending;

    public DateTime RequestedAt { get; set; }
        = DateTime.UtcNow;

    public DateTime? ReviewedAt { get; set; }

    public Guid? ReviewedByUserId { get; set; }

    public string? AdminRemarks { get; set; }

    public string? ReportFileUrl { get; set; }

    public TrainerProfile TrainerProfile { get; set; }
        = default!;

    public TrainingBatch TrainingBatch { get; set; }
        = default!;

    public User? ReviewedByUser { get; set; }
}

public enum TrainerReportRequestStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3
}