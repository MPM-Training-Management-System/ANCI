using server.Enums;
using server.Models.Participant;

namespace server.Models.Attendance;

public class AttendanceRecord
{
    public Guid Id { get; set; }

    public Guid AttendanceSessionId { get; set; }

    public Guid EnrollmentId { get; set; }

    public DateTime? TimeIn { get; set; }

    public DateTime? TimeOut { get; set; }

    public AttendanceStatus Status { get; set; }

    public string? Method { get; set; }

    public AttendanceSession AttendanceSession { get; set; } = default!;

    public Enrollment Enrollment { get; set; } = default!;
}