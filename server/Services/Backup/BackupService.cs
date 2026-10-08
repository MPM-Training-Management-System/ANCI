using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using server.Data;
using server.DTOs.Backup;
using server.Interfaces;
using BackupModel = server.Models.Backup.Backup;

namespace server.Services.Backup;

public class BackupService : IBackupService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<BackupService> _logger;

    public BackupService(
        ApplicationDbContext context,
        IConfiguration configuration,
        IWebHostEnvironment environment,
        ILogger<BackupService> logger)
    {
        _context = context;
        _configuration = configuration;
        _environment = environment;
        _logger = logger;
    }

    // ==========================================
    // CREATE BACKUP
    // ==========================================

    public async Task<BackupDto> CreateBackupAsync(
        Guid? createdByUserId = null)
    {
        var backupId = Guid.NewGuid();

        var backupDirectory = Path.Combine(
            _environment.ContentRootPath,
            "Backups");

        Directory.CreateDirectory(backupDirectory);

        var fileName =
            $"anci-backup-{DateTime.UtcNow:yyyyMMdd-HHmmss}-{backupId:N}.dump";

        var filePath = Path.Combine(
            backupDirectory,
            fileName);

        var backup = new BackupModel
        {
            Id = backupId,
            FileName = fileName,
            FilePath = filePath,
            FileSize = 0,
            BackupType = "Manual",
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = createdByUserId
        };

        _context.Backups.Add(backup);

        await _context.SaveChangesAsync();

        try
        {
            backup.Status = "InProgress";

            await _context.SaveChangesAsync();

            // ==========================================
            // GET DATABASE CONNECTION STRING
            // ==========================================

            var connectionString =
                _configuration.GetConnectionString(
                    "DefaultConnection");

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException(
                    "DefaultConnection was not found.");
            }

            // ==========================================
            // GET PG_DUMP PATH
            // ==========================================

            var pgDumpPath =
                _configuration["Backup:PgDumpPath"];

            if (string.IsNullOrWhiteSpace(pgDumpPath))
            {
                throw new InvalidOperationException(
                    "Backup:PgDumpPath is not configured.");
            }

            if (!File.Exists(pgDumpPath))
            {
                throw new InvalidOperationException(
                    $"pg_dump was not found at: {pgDumpPath}");
            }

            // ==========================================
            // PARSE NPGSQL CONNECTION STRING
            // ==========================================

            var npgsqlBuilder =
                new NpgsqlConnectionStringBuilder(
                    connectionString);

            if (string.IsNullOrWhiteSpace(
                    npgsqlBuilder.Host))
            {
                throw new InvalidOperationException(
                    "Database host is missing from DefaultConnection.");
            }

            if (string.IsNullOrWhiteSpace(
                    npgsqlBuilder.Database))
            {
                throw new InvalidOperationException(
                    "Database name is missing from DefaultConnection.");
            }

            if (string.IsNullOrWhiteSpace(
                    npgsqlBuilder.Username))
            {
                throw new InvalidOperationException(
                    "Database username is missing from DefaultConnection.");
            }

            if (string.IsNullOrWhiteSpace(
                    npgsqlBuilder.Password))
            {
                throw new InvalidOperationException(
                    "Database password is missing from DefaultConnection.");
            }

            // ==========================================
            // BUILD PG_DUMP PROCESS
            // ==========================================

            var startInfo = new ProcessStartInfo
            {
                FileName = pgDumpPath,

                Arguments =
    $"--format=custom " +
    $"--file=\"{filePath}\" " +
    $"--host=\"{npgsqlBuilder.Host}\" " +
    $"--port={npgsqlBuilder.Port} " +
    $"--username=\"{npgsqlBuilder.Username}\" " +
    $"--dbname=\"{npgsqlBuilder.Database}\" " +
    $"--no-password",

                RedirectStandardOutput = true,
                RedirectStandardError = true,

                UseShellExecute = false,
                CreateNoWindow = true
            };

            // ==========================================
            // PASS DATABASE PASSWORD SAFELY
            // ==========================================

            startInfo.Environment["PGPASSWORD"] =
    npgsqlBuilder.Password;

    startInfo.Environment["PGSSLMODE"] =
    "require";

            // ==========================================
            // START PG_DUMP
            // ==========================================

            using var process = new Process
            {
                StartInfo = startInfo
            };

            process.Start();

            var standardOutput =
                await process.StandardOutput.ReadToEndAsync();

            var standardError =
                await process.StandardError.ReadToEndAsync();

            await process.WaitForExitAsync();

            // ==========================================
            // CHECK PG_DUMP RESULT
            // ==========================================

            if (process.ExitCode != 0)
            {
                var errorMessage =
                    string.IsNullOrWhiteSpace(standardError)
                        ? "pg_dump failed."
                        : standardError.Trim();

                throw new InvalidOperationException(
                    errorMessage);
            }

            // ==========================================
            // CHECK BACKUP FILE
            // ==========================================

            if (!File.Exists(filePath))
            {
                throw new InvalidOperationException(
                    "Backup file was not created.");
            }

            var fileInfo =
                new FileInfo(filePath);

            if (fileInfo.Length <= 0)
            {
                throw new InvalidOperationException(
                    "Backup file was created but is empty.");
            }

            // ==========================================
            // UPDATE BACKUP RECORD
            // ==========================================

            backup.FileSize = fileInfo.Length;

            backup.Status = "Completed";

            backup.CompletedAt =
                DateTime.UtcNow;

            backup.ErrorMessage = null;

            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Database backup created successfully: {FileName}, Size: {FileSize} bytes",
                fileName,
                fileInfo.Length);

            return MapToDto(backup);
        }
        catch (Exception ex)
        {
            // ==========================================
            // HANDLE BACKUP FAILURE
            // ==========================================

            _logger.LogError(
                ex,
                "Failed to create database backup.");

            backup.Status = "Failed";

            backup.ErrorMessage = ex.Message;

            backup.CompletedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // ==========================================
            // DELETE PARTIAL BACKUP FILE
            // ==========================================

            if (File.Exists(filePath))
            {
                try
                {
                    File.Delete(filePath);
                }
                catch (Exception deleteException)
                {
                    _logger.LogWarning(
                        deleteException,
                        "Failed to delete incomplete backup file: {FilePath}",
                        filePath);
                }
            }

            throw;
        }
    }

    // ==========================================
    // GET ALL BACKUPS
    // ==========================================

    public async Task<IReadOnlyList<BackupDto>> GetAllAsync()
    {
        return await _context.Backups
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new BackupDto
            {
                Id = x.Id,
                FileName = x.FileName,
                FilePath = x.FilePath,
                FileSize = x.FileSize,
                BackupType = x.BackupType,
                Status = x.Status,
                CreatedAt = x.CreatedAt,
                CompletedAt = x.CompletedAt,
                CreatedByUserId = x.CreatedByUserId,
                ErrorMessage = x.ErrorMessage
            })
            .ToListAsync();
    }

    // ==========================================
    // GET BACKUP BY ID
    // ==========================================

    public async Task<BackupDto?> GetByIdAsync(Guid id)
    {
        return await _context.Backups
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new BackupDto
            {
                Id = x.Id,
                FileName = x.FileName,
                FilePath = x.FilePath,
                FileSize = x.FileSize,
                BackupType = x.BackupType,
                Status = x.Status,
                CreatedAt = x.CreatedAt,
                CompletedAt = x.CompletedAt,
                CreatedByUserId = x.CreatedByUserId,
                ErrorMessage = x.ErrorMessage
            })
            .FirstOrDefaultAsync();
    }

    // ==========================================
    // DOWNLOAD BACKUP
    // ==========================================

    public async Task<(byte[] FileBytes, string FileName)?>
        DownloadAsync(Guid id)
    {
        var backup = await _context.Backups
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);

        if (backup == null)
        {
            return null;
        }

        if (backup.Status != "Completed")
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(
                backup.FilePath))
        {
            return null;
        }

        if (!File.Exists(backup.FilePath))
        {
            return null;
        }

        var fileBytes =
            await File.ReadAllBytesAsync(
                backup.FilePath);

        return (
            fileBytes,
            backup.FileName
        );
    }

    // ==========================================
    // DELETE BACKUP
    // ==========================================

    public async Task<bool> DeleteAsync(Guid id)
    {
        var backup = await _context.Backups
            .FirstOrDefaultAsync(x => x.Id == id);

        if (backup == null)
        {
            return false;
        }

        // ==========================================
        // DELETE PHYSICAL BACKUP FILE
        // ==========================================

        if (!string.IsNullOrWhiteSpace(
                backup.FilePath))
        {
            if (File.Exists(backup.FilePath))
            {
                try
                {
                    File.Delete(
                        backup.FilePath);
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Failed to delete backup file: {FilePath}",
                        backup.FilePath);

                    throw;
                }
            }
        }

        // ==========================================
        // DELETE DATABASE RECORD
        // ==========================================

        _context.Backups.Remove(backup);

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Backup deleted successfully: {BackupId}",
            id);

        return true;
    }

    // ==========================================
    // MAP MODEL TO DTO
    // ==========================================

    private static BackupDto MapToDto(
        BackupModel backup)
    {
        return new BackupDto
        {
            Id = backup.Id,
            FileName = backup.FileName,
            FilePath = backup.FilePath,
            FileSize = backup.FileSize,
            BackupType = backup.BackupType,
            Status = backup.Status,
            CreatedAt = backup.CreatedAt,
            CompletedAt = backup.CompletedAt,
            CreatedByUserId = backup.CreatedByUserId,
            ErrorMessage = backup.ErrorMessage
        };
    }
}