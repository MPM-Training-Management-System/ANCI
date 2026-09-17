namespace server.DTOs.Service;

public class ServiceConsultationDto
{
    public Guid Id { get; set; }

    public Guid ServiceRequestId { get; set; }

    public string? ServiceName { get; set; }

    public string ApplicantName { get; set; } = string.Empty;

    public string ApplicantEmail { get; set; } = string.Empty;

    public DateTime ScheduledAt { get; set; }

    public DateTime? EndedAt { get; set; }

    public string MeetingLink { get; set; } = string.Empty;

    public string? Notes { get; set; }

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}