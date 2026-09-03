using server.Models.Training;

namespace server.Models.Participant;

public class Enrollment
{
    public Guid Id { get; set; }

    public Guid ParticipantProfileId { get; set; }

    public Guid TrainingBatchId { get; set; }

    public EnrollmentStatus Status { get; set; }

    public DateTime EnrolledAt { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public Guid? ReviewedByUserId { get; set; }

    public string? ReviewRemarks { get; set; }

    public ParticipantProfile ParticipantProfile { get; set; } = default!;

    public TrainingBatch TrainingBatch { get; set; } = default!;

    public ICollection<EnrollmentDocument> Documents { get; set; } = [];
}