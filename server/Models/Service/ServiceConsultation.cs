using server.Enums;

namespace server.Models.Service;

public class ServiceConsultation
{
    public Guid Id { get; set; }

    public Guid ServiceRequestId { get; set; }

    public DateTime ScheduledAt { get; set; }

    public DateTime? EndedAt { get; set; }

    public string MeetingLink { get; set; } = string.Empty;

    public string? Notes { get; set; }

    public ServiceConsultationStatus Status { get; set; }
        = ServiceConsultationStatus.Scheduled;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public ServiceRequest ServiceRequest { get; set; } = null!;
}