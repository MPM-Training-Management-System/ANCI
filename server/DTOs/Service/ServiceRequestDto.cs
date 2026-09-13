namespace server.DTOs.Service;

public class ServiceRequestDto
{
    public Guid Id { get; set; }

    public Guid ServiceId { get; set; }
    public string? ServiceName { get; set; }

    public Guid UserId { get; set; }
    public string? ApplicantName { get; set; }
    public string? ApplicantEmail { get; set; }

    public string? Remarks { get; set; }

    public string Status { get; set; } = string.Empty;

    public DateTime RequestedAt { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public Guid? ReviewedByUserId { get; set; }
}