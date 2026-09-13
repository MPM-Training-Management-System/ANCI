using server.Enums;
using server.Models.Auth;

namespace server.Models.Service;

public class ServiceRequest
{
    public Guid Id { get; set; }

    public Guid ServiceId { get; set; }

    public Guid UserId { get; set; }

    public string? Remarks { get; set; }

    public ServiceRequestStatus Status { get; set; }
        = ServiceRequestStatus.Pending;

    public DateTime RequestedAt { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public Guid? ReviewedByUserId { get; set; }

    // Navigation
    public Service Service { get; set; } = null!;

    public User User { get; set; } = null!;

    public User? ReviewedByUser { get; set; }
}