namespace server.DTOs.Reports;

public class TrainerReportDto
{
    public int TotalTrainers { get; set; }

    public int ActiveTrainers { get; set; }

    public int TotalAssignments { get; set; }

    public int TotalParticipants { get; set; }

    public PagedReportResultDto<TrainerReportItemDto> Results { get; set; } = new();
}

public class TrainerReportItemDto
{
    public Guid TrainerProfileId { get; set; }

    public string TrainerCode { get; set; } = string.Empty;

    public string TrainerName { get; set; } = string.Empty;

    public string TrainerEmail { get; set; } = string.Empty;

    public int AssignedBatches { get; set; }

    public int TotalParticipants { get; set; }

    public int TotalAttendanceRecords { get; set; }

    public int PresentAttendance { get; set; }

    public int AbsentAttendance { get; set; }

    public int LateAttendance { get; set; }

    public decimal AttendanceRate { get; set; }

    public int TotalAssessmentAttempts { get; set; }

    public int PassedAssessments { get; set; }

    public int FailedAssessments { get; set; }

    public decimal AssessmentPassRate { get; set; }

    public int TotalCertificates { get; set; }

    public int CompletionCertificates { get; set; }

    public int ParticipationCertificates { get; set; }

    public DateTime? LastAssignedAt { get; set; }

    public bool IsActive { get; set; }
}