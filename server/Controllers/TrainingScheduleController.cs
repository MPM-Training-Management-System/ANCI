using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Training.Schedule;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/training-batches/{trainingBatchId:guid}/schedule")]
[Authorize]
public class TrainingScheduleController : ControllerBase
{
    private readonly ITrainingScheduleService _scheduleService;

    public TrainingScheduleController(
        ITrainingScheduleService scheduleService)
    {
        _scheduleService = scheduleService;
    }

    // ============================================================
    // GET SCHEDULE RECOMMENDATION
    // GET /api/training-batches/{trainingBatchId}/schedule/recommendation
    // ============================================================

    [HttpGet("recommendation")]
    [Authorize(Roles = "Admin,Trainer")]
    public async Task<ActionResult<TrainingScheduleRecommendationDto>>
        GetRecommendation(Guid trainingBatchId)
    {
        try
        {
            var result =
                await _scheduleService.GetRecommendationAsync(
                    trainingBatchId
                );

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

    // ============================================================
    // GENERATE TRAINING SCHEDULE
    // POST /api/training-batches/{trainingBatchId}/schedule/generate
    // ============================================================

    [HttpPost("generate")]
    [Authorize(Roles = "Admin,Trainer")]
    public async Task<ActionResult<IReadOnlyList<TrainingSessionDto>>>
        GenerateSchedule(
            Guid trainingBatchId,
            [FromBody] GenerateTrainingScheduleRequest request)
    {
        try
        {
            var result =
                await _scheduleService.GenerateScheduleAsync(
                    trainingBatchId,
                    request
                );

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
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

    // ============================================================
    // GET TRAINING SCHEDULE
    //
    // GET /api/training-batches/{trainingBatchId}/schedule
    //
    // ADMIN / TRAINER ONLY
    // ============================================================

    [HttpGet]
    [Authorize(Roles = "Admin,Trainer")]
    public async Task<ActionResult<IReadOnlyList<TrainingSessionDto>>>
        GetSchedule(Guid trainingBatchId)
    {
        try
        {
            var result =
                await _scheduleService.GetScheduleAsync(
                    trainingBatchId
                );

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

    // ============================================================
    // GET PARTICIPANT TRAINING SCHEDULE
    //
    // GET /api/training-batches/{trainingBatchId}/schedule/participant
    //
    // PARTICIPANT ONLY
    // ============================================================

    [HttpGet("participant")]
    [Authorize(Roles = "Participant")]
    public async Task<ActionResult<IReadOnlyList<TrainingSessionDto>>>
        GetParticipantSchedule(Guid trainingBatchId)
    {
        var userIdClaim =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;

        if (!Guid.TryParse(userIdClaim, out var participantUserId))
        {
            return Unauthorized(new
            {
                message = "Invalid participant user identity."
            });
        }

        try
        {
            var result =
                await _scheduleService.GetParticipantScheduleAsync(
                    trainingBatchId,
                    participantUserId
                );

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // ============================================================
    // APPROVE TRAINING SCHEDULE
    //
    // POST /api/training-batches/{trainingBatchId}/schedule/approve
    //
    // ADMIN / TRAINER ONLY
    // ============================================================

    [HttpPost("approve")]
    [Authorize(Roles = "Admin,Trainer")]
    public async Task<IActionResult> ApproveSchedule(
        Guid trainingBatchId,
        [FromBody] ApproveTrainingScheduleRequest request)
    {
        try
        {
            await _scheduleService.ApproveScheduleAsync(
                trainingBatchId,
                request.Sessions
            );

            return Ok(new
            {
                message = "Training schedule approved successfully."
            });
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
}


// ============================================================
// APPROVE TRAINING SCHEDULE REQUEST
// ============================================================

public class ApproveTrainingScheduleRequest
{
    public IReadOnlyList<TrainingSessionDto> Sessions { get; set; }
        = new List<TrainingSessionDto>();
}