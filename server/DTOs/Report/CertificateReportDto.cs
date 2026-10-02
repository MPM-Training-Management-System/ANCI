namespace server.DTOs.Reports;

public class CertificateReportDto
{
    public int TotalCertificates { get; set; }

    public int CompletionCertificates { get; set; }

    public int ParticipationCertificates { get; set; }

    public int ActiveCertificates { get; set; }

    public int RevokedCertificates { get; set; }

    public PagedReportResultDto<CertificateReportItemDto> Results { get; set; } = new();
}

public class CertificateReportItemDto
{
    public Guid CertificateId { get; set; }

    public Guid EnrollmentId { get; set; }

    public Guid ParticipantId { get; set; }

    public string ParticipantCode { get; set; } = string.Empty;

    public string ParticipantName { get; set; } = string.Empty;

    public string ParticipantEmail { get; set; } = string.Empty;

    public string CertificateNumber { get; set; } = string.Empty;

    public string CertificateType { get; set; } = string.Empty;

    public string TrainingProgramName { get; set; } = string.Empty;

    public Guid TrainingBatchId { get; set; }

    public string BatchCode { get; set; } = string.Empty;

    public string? TrainerName { get; set; }

    public DateTime IssuedAt { get; set; }

    public string VerificationCode { get; set; } = string.Empty;

    public string? PdfUrl { get; set; }

    public string? CanvaDesignId { get; set; }

    public bool IsRevoked { get; set; }

    public DateTime? RevokedAt { get; set; }

    public string? RevocationReason { get; set; }
}