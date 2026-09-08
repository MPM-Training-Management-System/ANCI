namespace server.DTOs.Assessments;

public class SubmitAssessmentRequest
{
    public Guid AttemptId { get; set; }

    public IReadOnlyList<SubmitAssessmentAnswerRequest> Answers { get; set; } = [];
}

public class SubmitAssessmentAnswerRequest
{
    public Guid QuestionId { get; set; }

    public Guid? SelectedChoiceId { get; set; }
}