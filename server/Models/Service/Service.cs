namespace server.Models.Service;

public class Service
{
    public Guid Id { get; set; }

    public string ServiceCode { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string Category { get; set; } = string.Empty;

    public bool RequiresTraining { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    // Navigation
    public ICollection<ServiceRequirement> Requirements { get; set; }
        = new List<ServiceRequirement>();

    public ICollection<ServiceRequest> Requests { get; set; }
        = new List<ServiceRequest>();
}