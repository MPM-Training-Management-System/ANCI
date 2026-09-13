namespace server.DTOs.Service;

public class CreateServiceDto
{
    public string ServiceCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public bool RequiresTraining { get; set; }

    public List<CreateServiceRequirementDto> Requirements { get; set; } = new();
}

public class CreateServiceRequirementDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsRequired { get; set; }
    public int DisplayOrder { get; set; }
}