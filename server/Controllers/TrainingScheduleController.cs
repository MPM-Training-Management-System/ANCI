using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.DTOs.Training.Schedule;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/training-batches/{trainingBatchId:guid}/schedule")]
[Authorize(Roles = "Admin,Trainer")]
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
    // GET /api/training-batches/{trainingBatchId}/schedule
    // ============================================================

    [HttpGet]
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
    // APPROVE TRAINING SCHEDULE
    // POST /api/training-batches/{trainingBatchId}/schedule/approve
    // ============================================================

    // ============================================================
// APPROVE TRAINING SCHEDULE
// POST /api/training-batches/{trainingBatchId}/schedule/approve
// ============================================================
[HttpPost("approve")]
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

public class ApproveTrainingScheduleRequest
{
    public IReadOnlyList<TrainingSessionDto> Sessions { get; set; }
        = new List<TrainingSessionDto>();
}