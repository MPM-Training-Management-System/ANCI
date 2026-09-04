using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Training;
using server.Interfaces.Training;

namespace server.Controllers;

[ApiController]
[Route("api/training-batches")]
[Authorize]
public class TrainingBatchesController : ControllerBase
{
    private readonly ITrainingBatchService _service;

    public TrainingBatchesController(
        ITrainingBatchService service)
    {
        _service = service;
    }


    // ==========================================
    // GET /api/training-batches
    // ==========================================
    // Admin, Trainer, Participant
    // ==========================================

    [HttpGet]
    [Authorize(Roles = "Admin,Trainer,Participant")]
    public async Task<ActionResult<IEnumerable<TrainingBatchDto>>>
        GetAll()
    {
        var result = await _service.GetAllAsync();

        return Ok(result);
    }

    // ==========================================
// GET /api/training-batches/assigned
// ==========================================
// Trainer only
// Returns only batches assigned to
// the currently logged-in trainer
// ==========================================

[HttpGet("assigned")]
[Authorize(Roles = "Trainer")]
public async Task<ActionResult<IEnumerable<TrainingBatchDto>>>
    GetAssigned()
{
    var userIdClaim =
        User.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? User.FindFirst("sub")?.Value;

    if (!Guid.TryParse(userIdClaim, out var trainerUserId))
    {
        return Unauthorized(new
        {
            message = "Invalid trainer user identity."
        });
    }

    var result =
        await _service.GetAssignedAsync(trainerUserId);

    return Ok(result);
}


    // ==========================================
    // GET /api/training-batches/{id}
    // ==========================================
    // Admin, Trainer, Participant
    // ==========================================

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Trainer,Participant")]
    public async Task<ActionResult<TrainingBatchDto>>
        GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);

        if (result is null)
            return NotFound();

        return Ok(result);
    }


    // ==========================================
    // POST /api/training-batches
    // ==========================================
    // Admin only
    // ==========================================

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TrainingBatchDto>>
        Create(
            CreateTrainingBatchRequest request)
    {
        var result = await _service.CreateAsync(request);

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Id },
            result
        );
    }


    // ==========================================
    // PUT /api/training-batches/{id}
    // ==========================================
    // Admin only
    // ==========================================

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        Guid id,
        CreateTrainingBatchRequest request)
    {
        await _service.UpdateAsync(id, request);

        return NoContent();
    }


    // ==========================================
    // PUT /api/training-batches/{id}/status
    // ==========================================
    // Admin only
    // ==========================================

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody] string status)
    {
        await _service.UpdateStatusAsync(id, status);

        return NoContent();
    }


    // ==========================================
    // DELETE /api/training-batches/{id}
    // ==========================================
    // Admin only
    // ==========================================

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _service.DeleteAsync(id);

            return NoContent();
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
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }
}