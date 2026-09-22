namespace server.DTOs.Assessments;

public class PracticalAssessmentCriterionDto
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public decimal WeightPercentage { get; set; }

    public int DisplayOrder { get; set; }
}