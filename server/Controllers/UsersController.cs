using Microsoft.AspNetCore.Mvc;
using server.DTOs.Auth;
using server.Services.Interfaces;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
namespace server.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService
        _authService;

    public AuthController(
        IAuthService authService)
    {
        _authService =
            authService;
    }

   
    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request)
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
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }


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
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
    }
        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            return Ok(new
            {
                message = "Authenticated",

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
            });
}[Authorize(Roles = "Admin")]
[HttpGet("test/admin")]
public IActionResult AdminTest()
{
    return Ok(new
    {
        message =
            "Admin authorization successful."
    });
}
[Authorize(Roles = "Trainer")]
[HttpGet("test/trainer")]
public IActionResult TrainerTest()
{
    return Ok(new
    {
        message =
            "Trainer authorization successful."
    });
}
[Authorize(Roles = "Participant")]
[HttpGet("test/participant")]
public IActionResult ParticipantTest()
{
    return Ok(new
    {
        message =
            "Participant authorization successful."
    });
}
}