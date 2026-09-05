using server.Enums;
using server.Models.Attendance;

namespace server.Models.Training;

public class TrainingSession
{
    public Guid Id { get; set; }

    public Guid TrainingBatchId { get; set; }

    // Sequential number: 1, 2, 3...
    public int SessionNumber { get; set; }

    // Date of the actual training meeting
    public DateTime SessionDate { get; set; }

    // Scheduled training time
    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    // Computed by backend
    public decimal DurationHours { get; set; }

    public TrainingSessionStatus Status { get; set; }

    // Navigation
    public TrainingBatch TrainingBatch { get; set; } = default!;

    public ICollection<AttendanceSession> AttendanceSessions { get; set; } = [];
}