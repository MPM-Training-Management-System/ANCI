using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Participant;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/participant-profiles")]
[Authorize(Roles = "Participant")]
public class ParticipantProfileController
    : ControllerBase
{
    private readonly IParticipantProfileService
        _participantProfileService;


    public ParticipantProfileController(
        IParticipantProfileService participantProfileService)
    {
        _participantProfileService =
            participantProfileService;
    }


    // =========================================================
    // GET MY PROFILE
    // GET /api/participant-profiles/me
    // =========================================================

    [HttpGet("me")]
    public async Task<ActionResult<ParticipantProfileDto>>
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
            await _participantProfileService
                .GetMyProfileAsync(
                    userId.Value
                );


        if (profile is null)
        {
            return NotFound(
                new
                {
                    message =
                        "Participant profile not found."
                }
            );
        }


        return Ok(profile);
    }


    // =========================================================
    // UPDATE MY PROFILE
    // PUT /api/participant-profiles/me
    // =========================================================

    [HttpPut("me")]
    public async Task<ActionResult<ParticipantProfileDto>>
        UpdateMyProfile(
            [FromBody]
            UpdateParticipantProfileRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(
                ModelState
            );
        }


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


        try
        {
            var profile =
                await _participantProfileService
                    .UpdateMyProfileAsync(
                        userId.Value,
                        request
                    );


            if (profile is null)
            {
                return NotFound(
                    new
                    {
                        message =
                            "Participant profile not found."
                    }
                );
            }


            return Ok(
                new
                {
                    message =
                        "Participant profile updated successfully.",

                    profile
                }
            );
        }
        catch (
            InvalidOperationException ex)
        {
            return BadRequest(
                new
                {
                    message =
                        ex.Message
                }
            );
        }
    }


    // =========================================================
    // UPDATE PROFILE IMAGE
    // PUT /api/participant-profiles/me/image
    // =========================================================

    [HttpPut("me/image")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ParticipantProfileDto>>
        UpdateProfileImage(
            [FromForm]
            UpdateParticipantProfileImageRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(
                ModelState
            );
        }


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


        try
        {
            var profile =
                await _participantProfileService
                    .UpdateProfileImageAsync(
                        userId.Value,
                        request.ProfileImage
                    );


            if (profile is null)
            {
                return NotFound(
                    new
                    {
                        message =
                            "Participant profile not found."
                    }
                );
            }


            return Ok(
                new
                {
                    message =
                        "Profile image updated successfully.",

                    profile
                }
            );
        }
        catch (
            InvalidOperationException ex)
        {
            return BadRequest(
                new
                {
                    message =
                        ex.Message
                }
            );
        }
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