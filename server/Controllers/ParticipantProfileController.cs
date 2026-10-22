
using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Participant;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/participant-profiles")]
[Authorize(Roles = "Participant")]
public class ParticipantProfileController : ControllerBase
{
    private readonly IParticipantProfileService _participantProfileService;

    public ParticipantProfileController(
        IParticipantProfileService participantProfileService)
    {
        _participantProfileService = participantProfileService;
    }

    // =========================================================
    // GET MY PROFILE
    // GET /api/participant-profiles/me
    // =========================================================

    [HttpGet("me")]
    public async Task<ActionResult<ParticipantProfileDto>> GetMyProfile()
    {
        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(new
            {
                message = "User identity was not found."
            });
        }

        var profile = await _participantProfileService
            .GetMyProfileAsync(userId.Value);

        if (profile is null)
        {
            return NotFound(new
            {
                message = "Participant profile not found."
            });
        }

        return Ok(profile);
    }

    // =========================================================
    // UPDATE MY PROFILE
    // PUT /api/participant-profiles/me
    // application/json
    // =========================================================

    [HttpPut("me")]
    public async Task<ActionResult<ParticipantProfileDto>> UpdateMyProfile(
        [FromBody] UpdateParticipantProfileRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(new
            {
                message = "User identity was not found."
            });
        }

        try
        {
            var profile = await _participantProfileService
                .UpdateMyProfileAsync(userId.Value, request);

            if (profile is null)
            {
                return NotFound(new
                {
                    message = "Participant profile not found."
                });
            }

            return Ok(new
            {
                message = "Participant profile updated successfully.",
                profile
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
    // UPDATE PROFILE IMAGE
    // PUT /api/participant-profiles/me/image
    // multipart/form-data
    // =========================================================

    [HttpPut("me/image")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<ActionResult<ParticipantProfileDto>> UpdateProfileImage(
        [FromForm] UpdateParticipantProfileImageRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(new
            {
                message = "User identity was not found."
            });
        }

        try
        {
            var profile = await _participantProfileService
                .UpdateProfileImageAsync(
                    userId.Value,
                    request.ProfileImage);

            if (profile is null)
            {
                return NotFound(new
                {
                    message = "Participant profile not found."
                });
            }

            return Ok(new
            {
                message = "Profile image updated successfully.",
                profile
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
    // UPLOAD VALID ID
    // PUT /api/participant-profiles/me/valid-id
    // multipart/form-data
    // =========================================================

    [HttpPut("me/valid-id")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<ActionResult<ParticipantProfileDto>> UpdateValidId(
        [FromForm] UpdateParticipantValidIdRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var userId = GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized(new
            {
                message = "User identity was not found."
            });
        }

        try
        {
            var profile = await _participantProfileService
                .UpdateValidIdAsync(
                    userId.Value,
                    request.ValidIdImage,
                    request.ValidIdType,
                    request.ValidIdNumber);

            if (profile is null)
            {
                return NotFound(new
                {
                    message = "Participant profile not found."
                });
            }

            return Ok(new
            {
                message = "Valid ID uploaded successfully. It is awaiting verification.",
                profile
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
    // GET CURRENT USER ID FROM JWT
    // =========================================================

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(
            ClaimTypes.NameIdentifier)?.Value;

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return null;
        }

        return userId;
    }
}
