using server.Enums;
using server.Models.Training;

namespace server.Models.Attendance;

public class AttendanceSession
{
    public Guid Id { get; set; }

    public Guid TrainingBatchId { get; set; }

    public DateTime OpenedAt { get; set; }

    public DateTime? ClosedAt { get; set; }

    public AttendanceSessionStatus Status { get; set; }

    public Guid OpenedByUserId { get; set; }

    public TrainingBatch TrainingBatch { get; set; } = default!;

    public ICollection<AttendanceRecord> Records { get; set; } = [];
}