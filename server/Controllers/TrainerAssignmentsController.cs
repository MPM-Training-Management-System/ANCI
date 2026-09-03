using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Training;
using server.Interfaces.Training;

namespace server.Controllers;

[ApiController]
[Route("api/trainer-assignments")]
[Authorize(Roles = "Admin,Trainer")]
public class TrainerAssignmentsController : ControllerBase
{
    private readonly ITrainerAssignmentService _service;

    public TrainerAssignmentsController(
        ITrainerAssignmentService service)
    {
        _service = service;
    }


    // ==========================================
    // POST /api/trainer-assignments
    // ==========================================

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<TrainerAssignmentDto>>
        Assign(
            AssignTrainerRequest request)
    {
        var adminUserId = GetCurrentUserId();

        var result = await _service.AssignAsync(
            adminUserId,
            request
        );

        return Ok(result);
    }


    // ==========================================
    // GET /api/trainer-assignments
    // ==========================================

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<TrainerAssignmentDto>>>
        GetAll()
    {
        var result = await _service.GetAllAsync();

        return Ok(result);
    }


    // ==========================================
    // GET /api/trainer-assignments/me
    // ==========================================

    [HttpGet("me")]
    [Authorize(Roles = "Trainer")]
    public async Task<ActionResult<IEnumerable<TrainerAssignmentDto>>>
        GetMyAssignments()
    {
        var trainerUserId = GetCurrentUserId();

        var result =
            await _service.GetMyAssignmentsAsync(
                trainerUserId
            );

        return Ok(result);
    }


    // ==========================================
    // DELETE /api/trainer-assignments/{id}
    // ==========================================

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);

        return NoContent();
    }


    // ==========================================
    // CURRENT USER
    // ==========================================

    private Guid GetCurrentUserId()
    {
        var value = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        if (string.IsNullOrWhiteSpace(value))
        {
            value = User.FindFirstValue("sub");
        }

        if (!Guid.TryParse(value, out var userId))
        {
            throw new UnauthorizedAccessException(
                "Invalid authenticated user.");
        }

        return userId;
    }
}