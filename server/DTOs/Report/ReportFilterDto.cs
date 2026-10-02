namespace server.DTOs.Reports;

public class ReportFilterDto
{
    public Guid? TrainingProgramId { get; set; }

    public Guid? TrainingBatchId { get; set; }

    public Guid? TrainerProfileId { get; set; }

    public DateTime? DateFrom { get; set; }

    public DateTime? DateTo { get; set; }

    public string? Status { get; set; }

    public string? Search { get; set; }

    public int Page { get; set; } = 1;

    public int PageSize { get; set; } = 25;
}