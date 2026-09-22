namespace server.DTOs.Training;

public class CertificateDto
{
    public Guid Id { get; set; }

    public Guid EnrollmentId { get; set; }

    public string CertificateNumber { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public DateTime IssuedAt { get; set; }

    public string VerificationCode { get; set; } = string.Empty;

    public string? PdfUrl { get; set; }

    public string? CanvaDesignId { get; set; }

    public bool IsRevoked { get; set; }

    public string? RevocationReason { get; set; }

    public string? ParticipantName { get; set; }

    public string? TrainingName { get; set; }

    public string? BatchCode { get; set; }
}