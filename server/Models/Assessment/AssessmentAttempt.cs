using server.Models.Participant;

namespace server.Models.Assessment;

public class AssessmentAttempt
{
    public Guid Id { get; set; }

    public Guid WrittenAssessmentId { get; set; }

    public Guid EnrollmentId { get; set; }

    public int AttemptNumber { get; set; }

    public DateTime StartedAt { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public AssessmentAttemptStatus Status { get; set; }

    public WrittenAssessment WrittenAssessment { get; set; } = default!;

    public Enrollment Enrollment { get; set; } = default!;

    public ICollection<AssessmentAnswer> Answers { get; set; } = [];

    public AssessmentResult? Result { get; set; }
}