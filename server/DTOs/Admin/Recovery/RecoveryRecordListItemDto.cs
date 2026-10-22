namespace server.DTOs.Admin.Recovery;

public sealed class RecoveryRecordListItemDto
{
    public required string EntityName { get; init; }

    public required string RecordId { get; init; }

    public required string DisplayLabel { get; init; }

    public string? SecondaryLabel { get; init; }
}

public sealed class RecoveryRecordSearchResultDto
{
    public required string Module { get; init; }

    public required string EntityName { get; init; }

    public int Page { get; init; }

    public int PageSize { get; init; }

    public int TotalRecords { get; init; }

    public int TotalPages { get; init; }

    public IReadOnlyList<RecoveryRecordListItemDto> Records { get; init; } =
        Array.Empty<RecoveryRecordListItemDto>();
}