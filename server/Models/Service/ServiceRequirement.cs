namespace server.Models.Service;

public class ServiceRequirement
{
    public Guid Id { get; set; }

    public Guid ServiceId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsRequired { get; set; }

    public int DisplayOrder { get; set; }

    // Navigation
    public Service Service { get; set; } = null!;
}