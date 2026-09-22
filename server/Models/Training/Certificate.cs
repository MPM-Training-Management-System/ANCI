using System.ComponentModel.DataAnnotations;
using server.Models.Participant;

namespace server.Models.Training;

public class Certificate
{
    public Guid Id { get; set; }

    public Guid EnrollmentId { get; set; }

    [Required]
    [MaxLength(50)]
    public string CertificateNumber { get; set; } = string.Empty;

    [Required]
    public CertificateType Type { get; set; }

    [Required]
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(100)]
    public string VerificationCode { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? PdfUrl { get; set; }

    [MaxLength(100)]
    public string? CanvaDesignId { get; set; }

    public bool IsRevoked { get; set; } = false;

    public DateTime? RevokedAt { get; set; }

    [MaxLength(500)]
    public string? RevocationReason { get; set; }

    public Enrollment Enrollment { get; set; } = null!;
}

public enum CertificateType
{
    Participation = 1,
    Completion = 2
}