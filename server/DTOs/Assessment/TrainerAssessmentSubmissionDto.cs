namespace server.DTOs.Assessments;

public class TrainerAssessmentSubmissionDto
{
    public Guid AttemptId { get; set; }

    public Guid WrittenAssessmentId { get; set; }

    public Guid ParticipantId { get; set; }

    public string ParticipantName { get; set; } = string.Empty;

    public string ParticipantEmail { get; set; } = string.Empty;

    public int AttemptNumber { get; set; }

    public DateTime StartedAt { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public string Status { get; set; } = string.Empty;

    public int TotalQuestions { get; set; }

    public int CorrectAnswers { get; set; }

    public int TotalPoints { get; set; }

    public int EarnedPoints { get; set; }

    public decimal Percentage { get; set; }

    public bool IsPassed { get; set; }

    public DateTime? EvaluatedAt { get; set; }

    public List<TrainerAssessmentAnswerDto> Answers { get; set; } = [];
}


public class TrainerAssessmentAnswerDto
{
    public Guid QuestionId { get; set; }

    public int QuestionNumber { get; set; }

    public string QuestionText { get; set; } = string.Empty;

    public int Points { get; set; }

    public Guid? SelectedChoiceId { get; set; }

    public string? SelectedChoiceLabel { get; set; }

    public string? SelectedChoiceText { get; set; }

    public Guid? CorrectChoiceId { get; set; }

    public string? CorrectChoiceLabel { get; set; }

    public string? CorrectChoiceText { get; set; }

    public bool IsCorrect { get; set; }

    public int EarnedPoints { get; set; }
}