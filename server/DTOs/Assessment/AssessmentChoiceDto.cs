namespace server.DTOs.Assessments;

public class CreateAssessmentChoiceRequest
{
    public Guid AssessmentQuestionId { get; set; }

    public string ChoiceLabel { get; set; } = default!;

    public string ChoiceText { get; set; } = default!;

    public bool IsCorrect { get; set; }

    public int DisplayOrder { get; set; }
}

public class UpdateAssessmentChoiceRequest
{
    public string ChoiceLabel { get; set; } = default!;

    public string ChoiceText { get; set; } = default!;

    public bool IsCorrect { get; set; }

    public int DisplayOrder { get; set; }
}

public class AssessmentChoiceDto
{
    public Guid Id { get; set; }

    public Guid AssessmentQuestionId { get; set; }

    public string ChoiceLabel { get; set; } = default!;

    public string ChoiceText { get; set; } = default!;

    

    public int DisplayOrder { get; set; }
}


public class AdminAssessmentChoiceDto
{
    public Guid Id { get; set; }
    public Guid AssessmentQuestionId { get; set; }
    public string ChoiceLabel { get; set; } = default!;
    public string ChoiceText { get; set; } = default!;
    public bool IsCorrect { get; set; }
    public int DisplayOrder { get; set; }
}