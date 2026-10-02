namespace server.DTOs.TrainerDashboard;

public class TrainerDashboardStatsDto
{
    public int TotalParticipants { get; set; }

    public int TotalSessions { get; set; }

    public int CompletedSessions { get; set; }

    public double SessionProgress { get; set; }

    public double AttendanceRate { get; set; }
}