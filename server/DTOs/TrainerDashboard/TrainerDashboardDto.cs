namespace server.DTOs.TrainerDashboard;

public class TrainerDashboardDto
{
    public TrainerDashboardTrainingDto? Training { get; set; }

    public TrainerDashboardStatsDto Stats { get; set; } = new();

    public TrainerDashboardSessionDto? TodaySession { get; set; }

    public TrainerDashboardAttendanceDto Attendance { get; set; } = new();

    public List<TrainerDashboardUpcomingSessionDto> UpcomingSessions { get; set; } = [];
}