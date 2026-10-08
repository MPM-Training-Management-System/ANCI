using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Interfaces;
using System.Security.Claims;

namespace server.Controllers;

[ApiController]
[Route("api/admin/backups")]
[Authorize(Roles = "Admin")]
public class BackupController : ControllerBase
{
    private readonly IBackupService _backupService;

    public BackupController(IBackupService backupService)
    {
        _backupService = backupService;
    }

    // ==========================================
    // CREATE BACKUP
    // ==========================================

    [HttpPost]
    public async Task<IActionResult> CreateBackup()
    {
        var userIdClaim =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        Guid? userId = null;

        if (Guid.TryParse(userIdClaim, out var parsedUserId))
        {
            userId = parsedUserId;
        }

        try
        {
            var backup =
                await _backupService.CreateBackupAsync(userId);

            return Ok(backup);
        }
        catch (Exception ex)
        {
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Failed to create database backup.",
                    error = ex.Message
                });
        }
    }

    // ==========================================
    // GET ALL BACKUPS
    // ==========================================

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var backups =
            await _backupService.GetAllAsync();

        return Ok(backups);
    }

    // ==========================================
    // GET BACKUP BY ID
    // ==========================================

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var backup =
            await _backupService.GetByIdAsync(id);

        if (backup == null)
        {
            return NotFound(new
            {
                message = "Backup not found."
            });
        }

        return Ok(backup);
    }

    // ==========================================
    // DOWNLOAD BACKUP
    // ==========================================

    [HttpGet("{id:guid}/download")]
    public async Task<IActionResult> Download(Guid id)
    {
        var result =
            await _backupService.DownloadAsync(id);

        if (result == null)
        {
            return NotFound(new
            {
                message =
                    "Backup file was not found or is not available."
            });
        }

        return File(
            result.Value.FileBytes,
            "application/octet-stream",
            result.Value.FileName);
    }

    // ==========================================
    // DELETE BACKUP
    // ==========================================

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var deleted =
                await _backupService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Backup not found."
                });
            }

            return Ok(new
            {
                message = "Backup deleted successfully."
            });
        }
        catch (Exception ex)
        {
            return StatusCode(
                StatusCodes.Status500InternalServerError,
                new
                {
                    message = "Failed to delete backup.",
                    error = ex.Message
                });
        }
    }
}