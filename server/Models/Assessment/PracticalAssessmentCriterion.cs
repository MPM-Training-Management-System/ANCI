using System.ComponentModel.DataAnnotations;

namespace server.Models.Assessment;

public class PracticalAssessmentCriterion
{
    public Guid Id { get; set; }

    public Guid PracticalAssessmentId { get; set; }

    [Required]
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public decimal WeightPercentage { get; set; }

    public int DisplayOrder { get; set; }

    public PracticalAssessment PracticalAssessment { get; set; }
        = null!;

    public ICollection<PracticalAssessmentCriterionScore> Scores { get; set; }
        = new List<PracticalAssessmentCriterionScore>();
}