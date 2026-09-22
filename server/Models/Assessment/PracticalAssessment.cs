using System.ComponentModel.DataAnnotations;
using server.Models.Training;

namespace server.Models.Assessment;

public class PracticalAssessment
{
    public Guid Id { get; set; }

    public Guid TrainingBatchId { get; set; }

    [Required]
    [MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    public decimal PassingPercentage { get; set; } = 75;

    public bool IsPublished { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public TrainingBatch TrainingBatch { get; set; } = null!;

    public ICollection<PracticalAssessmentCriterion> Criteria { get; set; }
        = new List<PracticalAssessmentCriterion>();

    public ICollection<PracticalAssessmentResult> Results { get; set; }
        = new List<PracticalAssessmentResult>();
}