
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Services.Interfaces;

namespace server.Controllers.Admin;

[ApiController]
[Route("api/admin/recovery")]
[Authorize(Roles = "Admin")]
public sealed class AdminRecoveryController : ControllerBase
{
    private readonly IFullUserRecoveryService _fullUserRecoveryService;
    private readonly ILogger<AdminRecoveryController> _logger;

    public AdminRecoveryController(
        IFullUserRecoveryService fullUserRecoveryService,
        ILogger<AdminRecoveryController> logger)
    {
        _fullUserRecoveryService = fullUserRecoveryService;
        _logger = logger;
    }

    /// <summary>
    /// Preview missing records for a participant using their UserCode.
    /// Example: GET /api/admin/recovery/full-user/P26-001/preview
    /// </summary>
    [HttpGet("full-user/{userCode}/preview")]
    public async Task<IActionResult> PreviewFullUserRecovery(
        [FromRoute] string userCode,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userCode))
        {
            return BadRequest(new
            {
                success = false,
                message = "UserCode is required."
            });
        }

        try
        {
            var preview = await _fullUserRecoveryService.PreviewAsync(
                userCode.Trim(),
                cancellationToken);

            return Ok(new
            {
                success = true,
                message = "Recovery preview generated successfully.",
                data = preview
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to preview recovery for UserCode {UserCode}",
                userCode);

            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                success = false,
                message = "An error occurred while generating the recovery preview."
            });
        }
    }

    /// <summary>
    /// Restore missing participant records using their UserCode.
    /// Example: POST /api/admin/recovery/full-user/P26-001/restore
    /// </summary>
    [HttpPost("full-user/{userCode}/restore")]
    public async Task<IActionResult> RestoreFullUser(
        [FromRoute] string userCode,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userCode))
        {
            return BadRequest(new
            {
                success = false,
                message = "UserCode is required."
            });
        }

        try
        {
            var result = await _fullUserRecoveryService.RestoreAsync(
                userCode.Trim(),
                cancellationToken);

            if (!result.Success)
            {
                return Conflict(new
                {
                    success = false,
                    message = "Recovery could not be completed.",
                    data = result
                });
            }

            return Ok(new
            {
                success = true,
                message = $"Recovery completed for UserCode '{userCode.Trim()}'.",
                data = result
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                success = false,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to restore user records for UserCode {UserCode}",
                userCode);

            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                success = false,
                message = "An unexpected error occurred during recovery."
            });
        }
    }
}
