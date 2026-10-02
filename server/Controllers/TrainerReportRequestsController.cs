using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Trainer;
using server.Interfaces.Trainer;

namespace server.Controllers.Trainer;

[ApiController]
[Route("api/trainer/report-requests")]
[Authorize(Roles = "Trainer")]
public class TrainerReportRequestsController
    : ControllerBase
{
    private readonly ITrainerReportRequestService
        _service;

    public TrainerReportRequestsController(
        ITrainerReportRequestService service)
    {
        _service = service;
    }

    // =========================================================
    // CREATE REQUEST
    // POST /api/trainer/report-requests
    // =========================================================

    [HttpPost]
    public async Task<
        ActionResult<TrainerReportRequestDto>>
        Create(
            [FromBody]
            CreateTrainerReportRequestDto dto)
    {
        try
        {
            var userId =
                GetUserId();

            var result =
                await _service.CreateAsync(
                    userId,
                    dto);

            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new
                {
                    message = ex.Message
                });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(
                new
                {
                    message = ex.Message
                });
        }
    }

    // =========================================================
    // GET MY REQUESTS
    // GET /api/trainer/report-requests
    // =========================================================

    [HttpGet]
    public async Task<
        ActionResult<IReadOnlyList<TrainerReportRequestDto>>>
        GetMyRequests()
    {
        try
        {
            var userId =
                GetUserId();

            var result =
                await _service
                    .GetMyRequestsAsync(
                        userId);

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(
                new
                {
                    message = ex.Message
                });
        }
    }

    // =========================================================
    // GET USER ID
    // =========================================================

    private Guid GetUserId()
    {
        var claim =
            User.FindFirst(
                ClaimTypes.NameIdentifier);

        if (
            claim == null ||
            !Guid.TryParse(
                claim.Value,
                out var userId))
        {
            throw new UnauthorizedAccessException(
                "User identity could not be determined.");
        }

        return userId;
    }
}