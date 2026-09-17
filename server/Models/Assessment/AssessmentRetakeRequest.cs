using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using server.Enums;
using server.Models.Participant;

namespace server.Models.Assessment;

public class AssessmentRetakeRequest
{
    public Guid Id { get; set; }

    public Guid ParticipantId { get; set; }

    public Guid WrittenAssessmentId { get; set; }

    public Guid PreviousAttemptId { get; set; }

    [MaxLength(1000)]
    public string? Reason { get; set; }

    public AssessmentRetakeRequestStatus Status { get; set; }
        = AssessmentRetakeRequestStatus.Pending;

    public Guid? ReviewedBy { get; set; }

    public DateTime RequestedAt { get; set; }
        = DateTime.UtcNow;

    public DateTime? ReviewedAt { get; set; }

    [MaxLength(1000)]
    public string? AdminRemarks { get; set; }

    // ==========================================================
    // NAVIGATION PROPERTIES
    // ==========================================================

    [ForeignKey(nameof(ParticipantId))]
    public ParticipantProfile ParticipantProfile { get; set; }
        = null!;

    [ForeignKey(nameof(WrittenAssessmentId))]
    public WrittenAssessment WrittenAssessment { get; set; }
        = null!;

    [ForeignKey(nameof(PreviousAttemptId))]
    public AssessmentAttempt PreviousAttempt { get; set; }
        = null!;
}