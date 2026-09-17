using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Auth;
using server.DTOs.Trainer;
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
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// =========================================================

[AllowAnonymous]
[HttpPost("forgot-password")]
public async Task<IActionResult> ForgotPassword(
    [FromBody] ForgotPasswordRequest request)
{
    if (!ModelState.IsValid)
    {
        return ValidationProblem(ModelState);
    }

    var result =
        await _authService
            .ForgotPasswordAsync(request);

    return Ok(result);
}

// =========================================================
// VERIFY PASSWORD RESET OTP
// POST /api/auth/verify-reset-otp
// =========================================================

[AllowAnonymous]
[HttpPost("verify-reset-otp")]
public async Task<IActionResult> VerifyPasswordResetOtp(
    [FromBody] VerifyResetOtpRequest request)
{
    if (!ModelState.IsValid)
    {
        return ValidationProblem(ModelState);
    }

    var result =
        await _authService
            .VerifyPasswordResetOtpAsync(request);

    return Ok(result);
}
// =========================================================
// RESET PASSWORD
// POST /api/auth/reset-password
// =========================================================

[AllowAnonymous]
[HttpPost("reset-password")]
public async Task<IActionResult> ResetPassword(
    [FromBody] ResetPasswordRequest request)
{
    if (!ModelState.IsValid)
    {
        return ValidationProblem(ModelState);
    }

    var result =
        await _authService
            .ResetPasswordAsync(request);

    return Ok(result);
}

// =========================================================
// CHANGE PASSWORD
// POST /api/auth/change-password
// =========================================================

[Authorize]
[HttpPost("change-password")]
public async Task<IActionResult> ChangePassword(
    [FromBody] ChangePasswordRequest request)
{
    if (!ModelState.IsValid)
    {
        return ValidationProblem(ModelState);
    }

    var userIdClaim =
        User.FindFirst(
            ClaimTypes.NameIdentifier
        )?.Value;

    if (!Guid.TryParse(
            userIdClaim,
            out var userId))
    {
        return Unauthorized(
            new
            {
                message = "Invalid authentication."
            }
        );
    }

    var result =
        await _authService
            .ChangePasswordAsync(
                userId,
                request
            );

    return Ok(result);
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

}