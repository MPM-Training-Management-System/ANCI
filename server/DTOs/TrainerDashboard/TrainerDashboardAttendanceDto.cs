namespace server.DTOs.TrainerDashboard;

public class TrainerDashboardAttendanceDto
{
    public int Present { get; set; }

    public int Late { get; set; }

    public int Absent { get; set; }

    public int TotalRecorded { get; set; }

    public double AttendanceRate { get; set; }
}