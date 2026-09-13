namespace server.DTOs.Service;

public class CreateServiceRequestDto
{
    public Guid ServiceId { get; set; }
    public string? Remarks { get; set; }
}