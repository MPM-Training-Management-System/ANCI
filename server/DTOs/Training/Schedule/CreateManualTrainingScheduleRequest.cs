
using System.ComponentModel.DataAnnotations;

namespace server.DTOs.Training.Schedule;

public class CreateManualTrainingScheduleRequest
{
    [Required]
    public Guid TrainingBatchId { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "At least one session is required.")]
    public List<ManualTrainingSessionItemDto> Sessions { get; set; } = [];
}

public class ManualTrainingSessionItemDto
{
    [Range(1, int.MaxValue)]
    public int SessionNumber { get; set; }

    [Required]
    public DateOnly SessionDate { get; set; }

    [Required]
    public TimeOnly StartTime { get; set; }

    [Required]
    public TimeOnly EndTime { get; set; }

    [Range(typeof(decimal), "0.01", "24")]
    public decimal DurationHours { get; set; }
}
