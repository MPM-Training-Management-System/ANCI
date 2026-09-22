using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.DTOs.Training;
using server.Services.Training;
using System.Security.Claims;

namespace server.Controllers;

[ApiController]
[Route("api/participation")]
[Authorize]
public class ParticipationController : ControllerBase
{
    private readonly IParticipationService _service;

    public ParticipationController(
        IParticipationService service)
    {
        _service = service;
    }


    // ==========================================================
    // GET SETTING
    // GET /api/participation/setting/{batchId}
    // ==========================================================

    [HttpGet("setting/{batchId:guid}")]
    public async Task<IActionResult> GetSetting(
        Guid batchId)
    {
        try
        {
            var result =
                await _service.GetSettingAsync(batchId);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }


    // ==========================================================
    // SAVE SETTING
    // PUT /api/participation/setting/{batchId}
    // ==========================================================

    [HttpPut("setting/{batchId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SaveSetting(
        Guid batchId,
        [FromBody] SaveParticipationSettingRequest request)
    {
        try
        {
            var result =
                await _service.SaveSettingAsync(
                    batchId,
                    request.RequiredRecitations);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }


    // ==========================================================
    // GET SESSION PARTICIPANTS
    // GET /api/participation/session/{sessionId}
    // ==========================================================

    [HttpGet("session/{sessionId:guid}")]
    public async Task<IActionResult> GetSessionParticipants(
        Guid sessionId)
    {
        try
        {
            var result =
                await _service.GetSessionParticipantsAsync(
                    sessionId);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }


    // ==========================================================
    // RECORD RECITATION
    // POST /api/participation/record
    // ==========================================================

    [HttpPost("record")]
    [Authorize(Roles = "Admin,Trainer")]
    public async Task<IActionResult> RecordRecitation(
        [FromBody] RecordParticipationRequest request)
    {
        try
        {
            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier)?.Value;

            if (!Guid.TryParse(
                    userIdClaim,
                    out var userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid user identity."
                });
            }

            var result =
                await _service.RecordRecitationAsync(
                    request.EnrollmentId,
                    request.TrainingSessionId,
                    userId,
                    request.Remarks);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }


    // ==========================================================
    // DELETE RECITATION
    // DELETE /api/participation/record/{id}
    // ==========================================================

    [HttpDelete("record/{id:guid}")]
    [Authorize(Roles = "Admin,Trainer")]
    public async Task<IActionResult> RemoveRecitation(
        Guid id)
    {
        try
        {
            await _service.RemoveRecitationAsync(id);

            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }


    // ==========================================================
    // GET PARTICIPANT PROGRESS
    // GET /api/participation/progress/{enrollmentId}
    // ==========================================================

    [HttpGet("progress/{enrollmentId:guid}")]
    public async Task<IActionResult> GetProgress(
        Guid enrollmentId)
    {
        try
        {
            var result =
                await _service.GetParticipantProgressAsync(
                    enrollmentId);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }
}


// ==========================================================
// REQUEST DTOs
// ==========================================================

public class SaveParticipationSettingRequest
{
    public int RequiredRecitations { get; set; }
}


public class RecordParticipationRequest
{
    public Guid EnrollmentId { get; set; }

    public Guid TrainingSessionId { get; set; }

    public string? Remarks { get; set; }
}