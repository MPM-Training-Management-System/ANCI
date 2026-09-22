using System.ComponentModel.DataAnnotations;

namespace server.Models.Training;

public class ParticipationSetting
{
    public Guid Id { get; set; }

    public Guid TrainingBatchId { get; set; }

    /// <summary>
    /// Number of recitations required to reach 100% participation.
    /// Example: 5 recitations = 100%.
    /// </summary>
    [Range(1, 100)]
    public int RequiredRecitations { get; set; } = 5;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public TrainingBatch TrainingBatch { get; set; } = null!;
}