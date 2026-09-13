
namespace server.DTOs.Service;

public class ServiceRequirementDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsRequired { get; set; }
    public int DisplayOrder { get; set; }
}