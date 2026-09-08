namespace server.Models.Assessment;

public class AssessmentQuestion
{
    public Guid Id { get; set; }

    public Guid WrittenAssessmentId { get; set; }

    public int QuestionNumber { get; set; }

    public string QuestionText { get; set; } = default!;

    public int Points { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public WrittenAssessment WrittenAssessment { get; set; } = default!;

    public ICollection<AssessmentChoice> Choices { get; set; } = [];

    public ICollection<AssessmentAnswer> Answers { get; set; } = [];
}