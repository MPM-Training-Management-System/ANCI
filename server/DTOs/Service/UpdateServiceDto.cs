namespace server.DTOs.Service;

public class UpdateServiceDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public bool RequiresTraining { get; set; }
    public bool IsActive { get; set; }

    public List<UpdateServiceRequirementDto> Requirements { get; set; } = new();
}

public class UpdateServiceRequirementDto
{
    public Guid? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsRequired { get; set; }
    public int DisplayOrder { get; set; }
}