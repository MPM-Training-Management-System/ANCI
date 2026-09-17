using System.ComponentModel.DataAnnotations;

namespace server.DTOs.Assessments;

public class ReviewAssessmentRetakeRequest
{
    [Required]
    public bool Approve { get; set; }

    [MaxLength(1000)]
    public string? AdminRemarks { get; set; }
}