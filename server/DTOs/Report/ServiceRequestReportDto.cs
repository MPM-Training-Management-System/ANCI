namespace server.DTOs.Reports;

public class ServiceRequestReportDto
{
    public int TotalRequests { get; set; }

    public int PendingRequests { get; set; }

    public int ApprovedRequests { get; set; }

    public int RejectedRequests { get; set; }

    public int ReviewedRequests { get; set; }

    public PagedReportResultDto<ServiceRequestReportItemDto> Results { get; set; }
        = new();
}

public class ServiceRequestReportItemDto
{
    public Guid ServiceRequestId { get; set; }

    public Guid ServiceId { get; set; }

    public string ServiceCode { get; set; } = string.Empty;

    public string ServiceName { get; set; } = string.Empty;

    public string ServiceCategory { get; set; } = string.Empty;

    public bool RequiresTraining { get; set; }

    public Guid? UserId { get; set; }

    public string ApplicantName { get; set; } = string.Empty;

    public string ApplicantEmail { get; set; } = string.Empty;

    public string? Remarks { get; set; }

    public string RequestStatus { get; set; } = string.Empty;

    public DateTime RequestedAt { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public Guid? ReviewedByUserId { get; set; }

    public string? ReviewerName { get; set; }

    public string? ResolutionType { get; set; }

    public string? AdminRemarks { get; set; }
}