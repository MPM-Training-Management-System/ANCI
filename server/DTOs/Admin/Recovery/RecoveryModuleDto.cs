namespace server.DTOs.Admin.Recovery;

public sealed class RecoveryModuleDto
{
    public required string Key { get; init; }

    public required string Name { get; init; }

    public required string Description { get; init; }

    public int TotalRecords { get; set; }

    public List<RecoveryEntityCountDto> Entities { get; init; } = [];
}

public sealed class RecoveryEntityCountDto
{
    public required string EntityName { get; init; }

    public int RecordCount { get; set; }
}