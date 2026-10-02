namespace server.DTOs.Reports;

public class AttendanceReportDto
{
    public int TotalRecords { get; set; }

    public int PresentRecords { get; set; }

    public int AbsentRecords { get; set; }

    public int LateRecords { get; set; }

    public decimal AttendanceRate { get; set; }

    public PagedReportResultDto<AttendanceReportItemDto> Results { get; set; } = new();
}

public class AttendanceReportItemDto
{
    public Guid AttendanceRecordId { get; set; }

    public Guid EnrollmentId { get; set; }

    public Guid ParticipantId { get; set; }

    public string ParticipantCode { get; set; } = string.Empty;

    public string ParticipantName { get; set; } = string.Empty;

    public string ParticipantEmail { get; set; } = string.Empty;

    public string TrainingProgramName { get; set; } = string.Empty;

    public Guid TrainingBatchId { get; set; }

    public string BatchCode { get; set; } = string.Empty;

    public string? TrainerName { get; set; }

    // AttendanceRecord uses DateOnly
    public DateOnly AttendanceDate { get; set; }

    public DateTime? TimeIn { get; set; }

    public DateTime? TimeOut { get; set; }

    public string AttendanceStatus { get; set; } = string.Empty;

    public string AttendanceMethod { get; set; } = string.Empty;
}