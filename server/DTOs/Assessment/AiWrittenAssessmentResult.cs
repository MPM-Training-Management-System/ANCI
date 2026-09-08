public class AiWrittenAssessmentResult
{
    public IReadOnlyList<AiGeneratedQuestion> Questions { get; set; }
        = [];
}

public class AiGeneratedQuestion
{
    public int QuestionNumber { get; set; }

    public string QuestionText { get; set; } = default!;

    public int Points { get; set; }

    public IReadOnlyList<AiGeneratedChoice> Choices { get; set; }
        = [];
}

public class AiGeneratedChoice
{
    public string ChoiceLabel { get; set; } = default!;

    public string ChoiceText { get; set; } = default!;

    public bool IsCorrect { get; set; }

    public int DisplayOrder { get; set; }
}