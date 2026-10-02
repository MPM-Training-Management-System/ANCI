namespace server.DTOs.TrainerDashboard;

public class TrainerDashboardSessionDto
{
    public Guid TrainingSessionId { get; set; }

    public string Title { get; set; } = string.Empty;

    public DateTime SessionDate { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public string? Location { get; set; }

    public string Status { get; set; } = string.Empty;

    public bool AttendanceOpen { get; set; }
}