namespace server.DTOs.Service;

public class UpdateServiceRequestStatusDto
{
    public string Status { get; set; } = string.Empty;

    public string? Remarks { get; set; }
}