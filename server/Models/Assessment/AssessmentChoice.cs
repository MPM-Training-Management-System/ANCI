namespace server.Models.Assessment;

public class AssessmentChoice
{
    public Guid Id { get; set; }

    public Guid AssessmentQuestionId { get; set; }

    public string ChoiceLabel { get; set; } = default!;

    public string ChoiceText { get; set; } = default!;

    public bool IsCorrect { get; set; }

    public int DisplayOrder { get; set; }

    public AssessmentQuestion AssessmentQuestion { get; set; } = default!;

    public ICollection<AssessmentAnswer> Answers { get; set; } = [];
}