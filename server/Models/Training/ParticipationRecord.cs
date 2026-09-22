using System.ComponentModel.DataAnnotations;
using server.Models.Participant;

namespace server.Models.Training;

public class ParticipationRecord
{
    public Guid Id { get; set; }

    public Guid EnrollmentId { get; set; }

    public Guid TrainingSessionId { get; set; }

    public Guid RecordedByUserId { get; set; }

    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(500)]
    public string? Remarks { get; set; }

    public Enrollment Enrollment { get; set; } = null!;

    public TrainingSession TrainingSession { get; set; } = null!;
}