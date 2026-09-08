namespace server.DTOs.Assessments;

public class CreateAssessmentQuestionRequest
{
    public Guid WrittenAssessmentId { get; set; }

    public int QuestionNumber { get; set; }

    public string QuestionText { get; set; } = default!;

    public int Points { get; set; }
}

public class UpdateAssessmentQuestionRequest
{
    public int QuestionNumber { get; set; }

    public string QuestionText { get; set; } = default!;

    public int Points { get; set; }
}

public class AssessmentQuestionDto
{
    public Guid Id { get; set; }

    public Guid WrittenAssessmentId { get; set; }

    public int QuestionNumber { get; set; }

    public string QuestionText { get; set; } = default!;

    public int Points { get; set; }

    public IReadOnlyList<AssessmentChoiceDto> Choices { get; set; } = [];
}



public class AdminAssessmentQuestionDto
{
    public Guid Id { get; set; }
    public Guid WrittenAssessmentId { get; set; }
    public int QuestionNumber { get; set; }
    public string QuestionText { get; set; } = default!;
    public int Points { get; set; }

    public IReadOnlyList<AdminAssessmentChoiceDto> Choices { get; set; }
        = [];
}