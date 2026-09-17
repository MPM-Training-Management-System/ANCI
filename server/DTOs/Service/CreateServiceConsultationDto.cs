namespace server.DTOs.Service;

public class CreateServiceConsultationDto
{
    public Guid ServiceRequestId { get; set; }

    public DateTime ScheduledAt { get; set; }

    public string MeetingLink { get; set; } = string.Empty;

    public string? Notes { get; set; }
}