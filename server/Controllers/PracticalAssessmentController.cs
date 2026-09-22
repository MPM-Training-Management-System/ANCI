using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.DTOs.Assessments;
using server.Services.Interfaces;
using System.Security.Claims;

namespace server.Controllers;

[ApiController]
[Route("api/practical-assessment")]
[Authorize]
public class PracticalAssessmentController
    : ControllerBase
{
    private readonly IPracticalAssessmentService _service;

    public PracticalAssessmentController(
        IPracticalAssessmentService service)
    {
        _service = service;
    }


    // ==========================================================
    // ADMIN
    // CREATE
    // POST: api/practical-assessment
    // ==========================================================

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(
        [FromBody] CreatePracticalAssessmentRequest request)
    {
        try
        {
            var result =
                await _service.CreateAsync(request);

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
    // ADMIN
    // GET ALL
    // GET: api/practical-assessment
    // ==========================================================

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var result =
                await _service.GetAllAsync();

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(
                500,
                new
                {
                    message =
                        "An error occurred while retrieving practical assessments.",
                    error = ex.Message
                });
        }
    }


    // ==========================================================
    // ADMIN
    // GET BY ID
    // GET: api/practical-assessment/{id}
    // ==========================================================

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Trainer")]
    public async Task<IActionResult> GetById(
        Guid id)
    {
        try
        {
            var result =
                await _service.GetByIdAsync(id);

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
    // ADMIN
    // UPDATE
    // PUT: api/practical-assessment/{id}
    // ==========================================================

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody]
        CreatePracticalAssessmentRequest request)
    {
        try
        {
            var result =
                await _service.UpdateAsync(
                    id,
                    request);

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
    // ADMIN
    // DELETE
    // DELETE: api/practical-assessment/{id}
    // ==========================================================

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(
        Guid id)
    {
        try
        {
            await _service.DeleteAsync(id);

            return Ok(new
            {
                message =
                    "Practical assessment deleted successfully."
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


    // ==========================================================
    // ADMIN
    // PUBLISH / UNPUBLISH
    // POST: api/practical-assessment/{id}/publish
    // ==========================================================

    [HttpPut("{id:guid}/publish")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Publish(
        Guid id,
        [FromQuery] bool isPublished = true)
    {
        try
        {
            var result =
                await _service.SetPublishedAsync(
                    id,
                    isPublished);

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
    // TRAINER
    // GET ASSIGNED ASSESSMENTS
    // GET: api/practical-assessment/trainer
    // ==========================================================

    [HttpGet("trainer")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult>
        GetAssignedAssessments()
    {
        try
        {
            var trainerUserId =
                GetCurrentUserId();

            var result =
                await _service
                    .GetAssignedAssessmentsAsync(
                        trainerUserId);

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
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
    }


    // ==========================================================
    // TRAINER
    // EVALUATE
    // POST: api/practical-assessment/evaluate
    // ==========================================================

    [HttpPost("evaluate")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> Evaluate(
        [FromBody]
        EvaluatePracticalAssessmentRequest request)
    {
        try
        {
            var trainerUserId =
                GetCurrentUserId();

            var result =
                await _service.EvaluateAsync(
                    trainerUserId,
                    request);

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
            return Unauthorized(new
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
    // TRAINER
    // GET RESULTS
    // GET: api/practical-assessment/{id}/results
    // ==========================================================

    [HttpGet("{id:guid}/results")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> GetResults(
        Guid id)
    {
        try
        {
            var trainerUserId =
                GetCurrentUserId();

            var result =
                await _service.GetResultsAsync(
                    trainerUserId,
                    id);

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
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
    }


    // ==========================================================
    // TRAINER
    // GET RESULT BY ENROLLMENT
    // GET: api/practical-assessment/result/{enrollmentId}
    // ==========================================================

    [HttpGet("result/{enrollmentId:guid}")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> GetResult(
        Guid enrollmentId)
    {
        try
        {
            var trainerUserId =
                GetCurrentUserId();

            var result =
                await _service.GetResultAsync(
                    trainerUserId,
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
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
    }


    // ==========================================================
    // PRIVATE
    // CURRENT USER
    // ==========================================================

    private Guid GetCurrentUserId()
    {
        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (
            string.IsNullOrWhiteSpace(
                userId))
        {
            throw new UnauthorizedAccessException(
                "User ID was not found in the authentication token.");
        }

        if (!Guid.TryParse(
                userId,
                out var parsedUserId))
        {
            throw new UnauthorizedAccessException(
                "Invalid user ID in authentication token.");
        }

        return parsedUserId;
    }
}