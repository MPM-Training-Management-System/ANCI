using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Enrollment;
using server.DTOs.Training;

using server.Services.Interfaces;
using server.Interfaces.Training;

namespace server.Controllers;

[ApiController]
[Route("api/enrollments")]
[Authorize]
public class EnrollmentsController : ControllerBase
{
    private readonly IEnrollmentService _service;
    private readonly ITrainingBatchService _trainingBatchService;

    public EnrollmentsController(
        IEnrollmentService service,
        ITrainingBatchService trainingBatchService)
    {
        _service = service;
        _trainingBatchService = trainingBatchService;
    }


    // =========================================================
    // POST /api/enrollments
    //
    // PARTICIPANT ONLY
    //
    // Creates a new enrollment application.
    // =========================================================

    [HttpPost]
    [Authorize(Roles = "Participant")]
    public async Task<ActionResult<EnrollmentDto>> Create(
        CreateEnrollmentRequest request)
    {
        var userId = GetCurrentUserId();

        try
        {
            var result =
                await _service.CreateAsync(
                    userId,
                    request
                );

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Id },
                result
            );
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


    // =========================================================
    // GET /api/enrollments/me
    //
    // PARTICIPANT ONLY
    //
    // Gets all enrollments of the current participant.
    // =========================================================

    [HttpGet("me")]
[Authorize(Roles = "Participant")]
public async Task<
    ActionResult<IEnumerable<EnrollmentDto>>
> GetMyEnrollments()
{
    var userId = GetCurrentUserId();

    Console.WriteLine("========== CURRENT USER ==========");
    Console.WriteLine($"User ID: {userId}");
    Console.WriteLine($"IsAuthenticated: {User.Identity?.IsAuthenticated}");

    foreach (var claim in User.Claims)
    {
        Console.WriteLine(
            $"CLAIM: {claim.Type} = {claim.Value}"
        );
    }

    Console.WriteLine("=================================");

    var result =
        await _service.GetMyEnrollmentsAsync(
            userId
        );

    return Ok(result);
}


    // =========================================================
    // GET /api/enrollments/{id}
    //
    // PARTICIPANT ONLY
    //
    // Gets one enrollment belonging to the
    // current participant.
    // =========================================================

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Participant")]
    public async Task<ActionResult<EnrollmentDto>>
        GetById(Guid id)
    {
        var userId = GetCurrentUserId();

        try
        {
            var result =
                await _service.GetByIdAsync(
                    id,
                    userId
                );

            if (result is null)
                return NotFound();

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }


    // =========================================================
    // GET /api/enrollments/requirements/{trainingBatchId}
    //
    // PARTICIPANT ONLY
    //
    // Gets the requirements of the Training Program
    // connected to the selected Training Batch.
    //
    // Flow:
    //
    // TrainingBatch
    //      ↓
    // TrainingProgramId
    //      ↓
    // TrainingProgramRequirement
    //
    // Used by Enrollment Step 2.
    // =========================================================

    [HttpGet("requirements/{trainingBatchId:guid}")]
    [Authorize(Roles = "Participant,Admin")]
    public async Task<
        ActionResult<IEnumerable<TrainingProgramRequirementDto>>
    > GetEnrollmentRequirements(
        Guid trainingBatchId)
    {
        try
        {
            var result =
                await _trainingBatchService
                    .GetRequirementsAsync(
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
    }


    // =========================================================
    // GET /api/enrollments/pending
    //
    // ADMIN ONLY
    //
    // Gets all pending enrollment applications
    // for administrator review.
    // =========================================================

    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<
        ActionResult<IEnumerable<EnrollmentDto>>
    > GetPending()
    {
        var result =
            await _service.GetAllForAdminAsync();

        return Ok(result);
    }


    // =========================================================
    // PUT /api/enrollments/{id}/review
    //
    // ADMIN ONLY
    //
    // Approves or rejects an enrollment application.
    // =========================================================

    [HttpPut("{id:guid}/review")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Review(
        Guid id,
        ReviewEnrollmentRequest request)
    {
        var adminUserId = GetCurrentUserId();

        try
        {
            await _service.ReviewAsync(
                id,
                adminUserId,
                request
            );

            return NoContent();
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
    }


    // =========================================================
    // CURRENT USER ID
    //
    // Gets the authenticated user's ID from JWT.
    // =========================================================

    private Guid GetCurrentUserId()
    {
        var claim =
            User.FindFirst(
                ClaimTypes.NameIdentifier
            );

        if (claim is null)
        {
            throw new UnauthorizedAccessException(
                "User ID claim not found."
            );
        }

        return Guid.Parse(
            claim.Value
        );
    }



    [HttpGet("trainer")]
    [Authorize(Roles = "Trainer")]
    public async Task<
        ActionResult<IEnumerable<EnrollmentDto>>
    > GetMyTrainerEnrollments()
    {
        var trainerUserId = GetCurrentUserId();

        var result =
            await _service.GetMyEnrollmentsForTrainerAsync(
                trainerUserId
            );

        return Ok(result);
    }
}