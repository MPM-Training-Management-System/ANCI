using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Admin;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/admin-profiles")]
[Authorize(Roles = "Admin")]
public class AdminProfileController
    : ControllerBase
{
    private readonly IAdminProfileService
        _adminProfileService;

    public AdminProfileController(
        IAdminProfileService adminProfileService)
    {
        _adminProfileService =
            adminProfileService;
    }

    // =========================================================
    // GET MY ADMIN PROFILE
    // GET /api/admin-profiles/me
    // =========================================================

    [HttpGet("me")]
    public async Task<ActionResult<AdminProfileDto>>
        GetMyProfile()
    {
        var userId =
            GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(
                new
                {
                    message =
                        "User identity was not found."
                }
            );
        }

        var profile =
            await _adminProfileService
                .GetMyProfileAsync(
                    userId.Value
                );

        if (profile is null)
        {
            return NotFound(
                new
                {
                    message =
                        "Admin profile not found."
                }
            );
        }

        return Ok(profile);
    }

    // =========================================================
    // GET CURRENT USER ID
    // =========================================================

    private Guid? GetCurrentUserId()
    {
        var userIdClaim =
            User.FindFirst(
                ClaimTypes.NameIdentifier
            )?.Value;

        if (
            string.IsNullOrWhiteSpace(
                userIdClaim
            )
        )
        {
            return null;
        }

        if (
            !Guid.TryParse(
                userIdClaim,
                out var userId
            )
        )
        {
            return null;
        }

        return userId;
    }
}