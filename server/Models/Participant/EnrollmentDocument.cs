using server.Enums;
using server.Models.Training;

namespace server.Models.Participant;

public class EnrollmentDocument
{
    public Guid Id { get; set; }

    public Guid EnrollmentId { get; set; }

   public Guid RequirementId { get; set; }

    public string FileName { get; set; } = default!;

    public string FileUrl { get; set; } = default!;

    public DocumentStatus Status { get; set; }

    public string? ReviewRemarks { get; set; }

    public DateTime UploadedAt { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public Enrollment Enrollment { get; set; } = default!;

    public TrainingProgramRequirement Requirement { get; set; } = default!;
}