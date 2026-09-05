using server.Enums;

namespace server.DTOs.Training.Schedule;

public class TrainingSessionDto
{
    public Guid Id { get; set; }

    public Guid TrainingBatchId { get; set; }

    public int SessionNumber { get; set; }

    public DateOnly SessionDate { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public decimal DurationHours { get; set; }

    public TrainingSessionStatus Status { get; set; }
}