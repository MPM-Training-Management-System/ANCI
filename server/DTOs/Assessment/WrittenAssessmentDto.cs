namespace server.DTOs.Assessments;

public class CreateWrittenAssessmentRequest
{
    public Guid TrainingBatchId { get; set; }

    public string Title { get; set; } = default!;

    public string? Description { get; set; }

    public int PassingPercentage { get; set; }
}

public class UpdateWrittenAssessmentRequest
{
    public string Title { get; set; } = default!;

    public string? Description { get; set; }

    public int PassingPercentage { get; set; }
}

public class WrittenAssessmentDto
{
    public Guid Id { get; set; }

    public Guid TrainingBatchId { get; set; }

    public string BatchCode { get; set; } = default!;

    public string Title { get; set; } = default!;

    public string? Description { get; set; }

    public int PassingPercentage { get; set; }

    public bool IsPublished { get; set; }

    public int QuestionCount { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}