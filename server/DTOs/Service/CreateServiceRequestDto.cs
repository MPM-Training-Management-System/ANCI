namespace server.DTOs.Service;

public class CreateServiceRequestDto
{
    public Guid ServiceId { get; set; }

    public string ApplicantName { get; set; } = string.Empty;

    public string ApplicantEmail { get; set; } = string.Empty;

    public string? Remarks { get; set; }
}