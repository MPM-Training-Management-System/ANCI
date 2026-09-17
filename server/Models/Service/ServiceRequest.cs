using server.Enums;
using server.Models.Auth;

namespace server.Models.Service;

public class ServiceRequest
{
    public Guid Id { get; set; }

    public Guid ServiceId { get; set; }

    // Optional because the request can come from the public landing page
    public Guid? UserId { get; set; }

    // Applicant information from the landing page
    public string ApplicantName { get; set; } = string.Empty;

    public string ApplicantEmail { get; set; } = string.Empty;

    public string? Remarks { get; set; }

    public ServiceRequestStatus Status { get; set; }
        = ServiceRequestStatus.Pending;

    public DateTime RequestedAt { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public Guid? ReviewedByUserId { get; set; }

    // Admin's decision after reviewing the request
    public ServiceRequestResolutionType? ResolutionType { get; set; }

    public string? AdminRemarks { get; set; }

    // Navigation
    public Service Service { get; set; } = null!;

    public User? User { get; set; }

    public User? ReviewedByUser { get; set; }
}