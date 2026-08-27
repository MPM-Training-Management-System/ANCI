using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Auth;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;


    public AuthController(
        IAuthService authService)
    {
        _authService =
            authService;
    }


    // =========================================================
    // REGISTER PARTICIPANT
    // POST /api/auth/register
    // multipart/form-data
    // =========================================================

    [AllowAnonymous]
    [HttpPost("register")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> RegisterParticipant(
        [FromForm] RegisterParticipantRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(
                ModelState
            );
        }


        try
        {
            var result =
                await _authService
                    .RegisterParticipantAsync(
                        request
                    );


            return StatusCode(
                StatusCodes.Status201Created,
                result
            );
        }
        catch (
            InvalidOperationException ex)
        {
            return Conflict(
                new
                {
                    message = ex.Message
                }
            );
        }
    }


    // =========================================================
    // REGISTER TRAINER
    // POST /api/auth/register/trainer
    // multipart/form-data
    // =========================================================

    [AllowAnonymous]
    [HttpPost("register/trainer")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> RegisterTrainer(
        [FromForm] RegisterTrainerRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(
                ModelState
            );
        }


        try
        {
            var result =
                await _authService
                    .RegisterTrainerAsync(
                        request
                    );


            return StatusCode(
                StatusCodes.Status201Created,
                result
            );
        }
        catch (
            InvalidOperationException ex)
        {
            return Conflict(
                new
                {
                    message = ex.Message
                }
            );
        }
    }


    // =========================================================
    // LOGIN
    // POST /api/auth/login
    // application/json
    // =========================================================

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(
                ModelState
            );
        }


        try
        {
            var result =
                await _authService
                    .LoginAsync(
                        request
                    );


            return Ok(result);
        }
        catch (
            UnauthorizedAccessException ex)
        {
            return Unauthorized(
                new
                {
                    message = ex.Message
                }
            );
        }
    }


    // =========================================================
    // CURRENT AUTHENTICATED USER
    // GET /api/auth/me
    // =========================================================

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        return Ok(
            new
            {
                message =
                    "Authenticated",

                userId =
                    User.FindFirst(
                        ClaimTypes.NameIdentifier
                    )?.Value,

                email =
                    User.FindFirst(
                        ClaimTypes.Email
                    )?.Value,

                role =
                    User.FindFirst(
                        ClaimTypes.Role
                    )?.Value
            }
        );
    }


    // =========================================================
    // ADMIN AUTHORIZATION TEST
    // GET /api/auth/test/admin
    // =========================================================

    [Authorize(Roles = "Admin")]
    [HttpGet("test/admin")]
    public IActionResult AdminTest()
    {
        return Ok(
            new
            {
                message =
                    "Admin authorization successful."
            }
        );
    }


    // =========================================================
    // TRAINER AUTHORIZATION TEST
    // GET /api/auth/test/trainer
    // =========================================================

    [Authorize(Roles = "Trainer")]
    [HttpGet("test/trainer")]
    public IActionResult TrainerTest()
    {
        return Ok(
            new
            {
                message =
                    "Trainer authorization successful."
            }
        );
    }


    // =========================================================
    // PARTICIPANT AUTHORIZATION TEST
    // GET /api/auth/test/participant
    // =========================================================

    [Authorize(Roles = "Participant")]
    [HttpGet("test/participant")]
    public IActionResult ParticipantTest()
    {
        return Ok(
            new
            {
                message =
                    "Participant authorization successful."
            }
        );
    }
}