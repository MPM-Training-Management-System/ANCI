namespace server.Models.Assessment;

public class AssessmentAnswer
{
    public Guid Id { get; set; }

    public Guid AssessmentAttemptId { get; set; }

    public Guid AssessmentQuestionId { get; set; }

    public Guid? SelectedChoiceId { get; set; }

    public int EarnedPoints { get; set; }

    public bool IsCorrect { get; set; }

    public AssessmentAttempt AssessmentAttempt { get; set; } = default!;

    public AssessmentQuestion AssessmentQuestion { get; set; } = default!;

    public AssessmentChoice? SelectedChoice { get; set; }
}