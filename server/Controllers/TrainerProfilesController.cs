using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Trainer;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/trainer-profiles")]
[Authorize]
public class TrainerProfilesController
    : ControllerBase
{
    private readonly ITrainerProfileService _service;


    public TrainerProfilesController(
        ITrainerProfileService service)
    {
        _service = service;
    }


    // =========================================================
    // GET MY PROFILE
    // GET /api/trainer-profiles/me
    // =========================================================

    [HttpGet("me")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult>
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
                        "Invalid authenticated user."
                }
            );
        }


        var result =
            await _service.GetMyProfileAsync(
                userId.Value
            );


        if (result is null)
        {
            return NotFound(
                new
                {
                    message =
                        "Trainer profile not found."
                }
            );
        }


        return Ok(result);
    }


    // =========================================================
    // UPDATE MY PROFILE
    // PUT /api/trainer-profiles/me
    // =========================================================

    [HttpPut("me")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult>
        UpdateMyProfile(
            [FromBody]
            UpdateTrainerProfileRequest request)
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
                        "Invalid authenticated user."
                }
            );
        }


        try
        {
            var result =
                await _service
                    .UpdateMyProfileAsync(
                        userId.Value,
                        request
                    );


            if (result is null)
            {
                return NotFound(
                    new
                    {
                        message =
                            "Trainer profile not found."
                    }
                );
            }


            return Ok(result);
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
    // GET TRAINER BY ID
    // GET /api/trainer-profiles/{id}
    // =========================================================

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult>
        GetById(
            Guid id)
    {
        var result =
            await _service.GetByIdAsync(
                id
            );


        if (result is null)
        {
            return NotFound(
                new
                {
                    message =
                        "Trainer profile not found."
                }
            );
        }


        return Ok(result);
    }


    // =========================================================
    // GET ACTIVE TRAINERS
    // GET /api/trainer-profiles/active
    // =========================================================

    [HttpGet("active")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult>
        GetActiveTrainers()
    {
        var result =
            await _service
                .GetActiveTrainersAsync();


        return Ok(result);
    }


    // =========================================================
    // CURRENT USER ID
    // =========================================================

    private Guid? GetCurrentUserId()
    {
        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );


        if (
            string.IsNullOrWhiteSpace(
                userId
            )
        )
        {
            return null;
        }


        if (
            !Guid.TryParse(
                userId,
                out var parsedUserId
            )
        )
        {
            return null;
        }


        return parsedUserId;
    }
}