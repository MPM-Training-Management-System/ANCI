namespace server.DTOs.TrainerDashboard;

public class TrainerDashboardUpcomingSessionDto
{
    public Guid TrainingSessionId { get; set; }

    public DateTime SessionDate { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public string Title { get; set; } = string.Empty;

    
}