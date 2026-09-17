using server.Enums;
using server.Models.Service;

namespace server.DTOs.Service;

public class ReviewServiceRequestDto
{
    public ServiceRequestStatus Status { get; set; }

    public ServiceRequestResolutionType? ResolutionType { get; set; }

    public string? AdminRemarks { get; set; }
}