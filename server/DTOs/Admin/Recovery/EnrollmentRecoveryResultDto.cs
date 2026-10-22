namespace server.DTOs.Admin.Recovery;

public sealed class EnrollmentRecoveryResultDto
{
    public Guid EnrollmentId { get; set; }

    public bool Success { get; set; }

    public int RestoredRecords { get; set; }

    public int SkippedRecords { get; set; }

    public List<string> RestoredEntities { get; set; } = [];

    public List<string> Messages { get; set; } = [];
}