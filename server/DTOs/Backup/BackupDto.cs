namespace server.DTOs.Backup;

public class BackupDto
{
    public Guid Id { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string? FilePath { get; set; }

    public long FileSize { get; set; }

    public string BackupType { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public Guid? CreatedByUserId { get; set; }

    public string? ErrorMessage { get; set; }
}