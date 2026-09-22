namespace server.DTOs.Training;

public class EligibleCertificateDto
{
    public Guid EnrollmentId { get; set; }

    public Guid TrainingBatchId { get; set; }

    public string? ParticipantName { get; set; }

    public string? TrainingName { get; set; }

    public string? BatchCode { get; set; }

    public decimal OverallGrade { get; set; }

    public bool IsPassed { get; set; }

    public bool HasParticipationCertificate { get; set; }

    public bool HasCompletionCertificate { get; set; }
}