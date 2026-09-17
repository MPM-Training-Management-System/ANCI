using server.Enums;

namespace server.DTOs.Service;

public class UpdateServiceConsultationDto
{
    public DateTime ScheduledAt { get; set; }

    public string MeetingLink { get; set; } = string.Empty;

    public string? Notes { get; set; }

    public ServiceConsultationStatus Status { get; set; }
}