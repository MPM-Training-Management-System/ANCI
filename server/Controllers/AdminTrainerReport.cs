using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Trainer;
using server.Interfaces.Trainer;

namespace server.Controllers.Admin;

[ApiController]
[Route("api/admin/trainer-report-requests")]
[Authorize(Roles = "Admin")]
public class AdminTrainerReportRequestsController
    : ControllerBase
{
    private readonly ITrainerReportRequestService
        _service;

    public AdminTrainerReportRequestsController(
        ITrainerReportRequestService service)
    {
        _service = service;
    }


    // =========================================================
    // GET ALL REPORT REQUESTS
    // =========================================================

    [HttpGet]
    public async Task<
        ActionResult<
            IReadOnlyList<AdminTrainerReportRequestDto>>>
        GetAll()
    {
        try
        {
            var result =
                await _service
                    .GetAdminRequestsAsync();

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
    // APPROVE
    // =========================================================

    [HttpPost("{id:guid}/approve")]
    public async Task<
        ActionResult<AdminTrainerReportRequestDto>>
        Approve(
            Guid id,
            [FromBody]
            ReviewTrainerReportRequestDto dto)
    {
        try
        {
            var adminUserId =
                GetUserId();

            var result =
                await _service
                    .ApproveAsync(
                        adminUserId,
                        id,
                        dto);

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
    // REJECT
    // =========================================================

    [HttpPost("{id:guid}/reject")]
    public async Task<
        ActionResult<AdminTrainerReportRequestDto>>
        Reject(
            Guid id,
            [FromBody]
            ReviewTrainerReportRequestDto dto)
    {
        try
        {
            var adminUserId =
                GetUserId();

            var result =
                await _service
                    .RejectAsync(
                        adminUserId,
                        id,
                        dto);

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
    // GET CURRENT USER ID
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