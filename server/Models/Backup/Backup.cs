namespace server.Models.Backup;

public class Backup
{
    public Guid Id { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string? FilePath { get; set; }

    public long FileSize { get; set; }

    public string BackupType { get; set; } = "Manual";

    public string Status { get; set; } = "Pending";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? CompletedAt { get; set; }

    public Guid? CreatedByUserId { get; set; }

    public string? ErrorMessage { get; set; }
}