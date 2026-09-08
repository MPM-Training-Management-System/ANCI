namespace server.DTOs.Assessments;

public class AiAssessmentGenerationResult
{
    public IReadOnlyList<AiAssessmentQuestionResult> Questions { get; set; } = [];
}

public class AiAssessmentQuestionResult
{
    public string QuestionText { get; set; } = default!;

    public int Points { get; set; } = 1;

    public IReadOnlyList<AiAssessmentChoiceResult> Choices { get; set; } = [];
}

public class AiAssessmentChoiceResult
{
    public string ChoiceLabel { get; set; } = default!;

    public string ChoiceText { get; set; } = default!;

    public bool IsCorrect { get; set; }

    public int DisplayOrder { get; set; }
}