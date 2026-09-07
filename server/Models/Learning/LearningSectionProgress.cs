using server.Models.Participant;


namespace server.Models.Learning;

public class LearningSectionProgress
{
    public Guid Id { get; set; }

    public Guid EnrollmentId { get; set; }

    public Guid LearningSectionId { get; set; }

    public bool IsRead { get; set; }

    public DateTime? ReadAt { get; set; }

    public DateTime LastReadAt { get; set; }

    public Enrollment Enrollment { get; set; } = default!;

    public LearningSection LearningSection { get; set; } = default!;
}