using server.DTOs.Auth;
using server.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ACE.NextGen.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(
        IAuthService authService)
    {
        _authService = authService;
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
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }
}