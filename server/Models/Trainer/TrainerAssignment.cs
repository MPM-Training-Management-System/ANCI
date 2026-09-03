using server.Models.Trainer;
using server.Models.Training;

public class TrainerAssignment
{
    public Guid Id { get; set; }

    public Guid TrainerProfileId { get; set; }

    public Guid TrainingBatchId { get; set; }

    public Guid AssignedByUserId { get; set; }

    public DateTime AssignedAt { get; set; }

    public bool IsActive { get; set; }

    public TrainerProfile TrainerProfile { get; set; } = default!;

    public TrainingBatch TrainingBatch { get; set; } = default!;
}