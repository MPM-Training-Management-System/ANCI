
namespace server.DTOs.Admin.Recovery;

public sealed class FullUserRecoveryPreviewDto
{
    public Guid UserId { get; set; }

    public string UserCode { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public bool UserExistsInRecovery { get; set; }

    public bool UserExistsInProduction { get; set; }

    public int RelatedRecordsFound { get; set; }

    public int RecordsAlreadyInProduction { get; set; }

    public int RecordsMissingFromProduction { get; set; }

    public List<FullRecoveryEntitySummaryDto> Entities { get; set; } = [];

    public List<string> Warnings { get; set; } = [];
}

public sealed class FullRecoveryEntitySummaryDto
{
    public string EntityName { get; set; } = string.Empty;

    public int SourceCount { get; set; }

    public int ExistingCount { get; set; }

    public int MissingCount { get; set; }
}

public sealed class FullUserRecoveryResultDto
{
    public Guid UserId { get; set; }

    public bool Success { get; set; }

    public int RestoredRecords { get; set; }

    public int SkippedRecords { get; set; }

    public int FailedRecords { get; set; }

    public List<string> Messages { get; set; } = [];
}
