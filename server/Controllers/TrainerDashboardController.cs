using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.TrainerDashboard;
using server.Services.Interfaces;

using System.Security.Claims;

namespace server.Controllers;

[ApiController]
[Route("api/trainer-dashboard")]
[Authorize(Roles = "Trainer")]
public class TrainerDashboardController : ControllerBase
{
    private readonly ITrainerDashboardService
        _trainerDashboardService;

    public TrainerDashboardController(
        ITrainerDashboardService trainerDashboardService)
    {
        _trainerDashboardService =
            trainerDashboardService;
    }

    // =========================================================
    // GET TRAINER DASHBOARD
    // =========================================================

    [HttpGet]
    [ProducesResponseType(
        typeof(TrainerDashboardDto),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(
        StatusCodes.Status404NotFound)]
    public async Task<ActionResult<TrainerDashboardDto>>
        GetDashboard()
    {
        var userIdClaim =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(
            userIdClaim,
            out var trainerUserId))
        {
            return Unauthorized(
                new
                {
                    message =
                        "Invalid trainer user ID."
                });
        }

        var dashboard =
            await _trainerDashboardService
                .GetDashboardAsync(
                    trainerUserId);

        return Ok(dashboard);
    }
}