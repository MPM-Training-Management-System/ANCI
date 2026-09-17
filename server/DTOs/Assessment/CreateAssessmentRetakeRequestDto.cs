using System.ComponentModel.DataAnnotations;

namespace server.DTOs.Assessments;

public class CreateAssessmentRetakeRequest
{
    [Required]
    public Guid WrittenAssessmentId { get; set; }

    [Required]
    public Guid PreviousAttemptId { get; set; }

    [MaxLength(1000)]
    public string? Reason { get; set; }
}