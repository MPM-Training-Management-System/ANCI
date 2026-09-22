namespace server.DTOs.Assessments;

public class PracticalAssessmentDto
{
    public Guid Id { get; set; }

    public Guid TrainingBatchId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public decimal PassingPercentage { get; set; }

    public bool IsPublished { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public List<PracticalAssessmentCriterionDto> Criteria { get; set; }
        = new();
}