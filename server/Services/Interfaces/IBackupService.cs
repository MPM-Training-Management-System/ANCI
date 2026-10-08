using server.DTOs.Backup;

namespace server.Interfaces;

public interface IBackupService
{
    Task<BackupDto> CreateBackupAsync(
        Guid? createdByUserId = null);

    Task<IReadOnlyList<BackupDto>> GetAllAsync();

    Task<BackupDto?> GetByIdAsync(Guid id);

    Task<(byte[] FileBytes, string FileName)?> DownloadAsync(
        Guid id);

    Task<bool> DeleteAsync(Guid id);
}