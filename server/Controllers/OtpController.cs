using Microsoft.AspNetCore.Mvc;
using server.DTOs.Otp;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/otp")]
public class OtpController : ControllerBase
{
    private readonly IOtpService _otpService;

    public OtpController(
        IOtpService otpService)
    {
        _otpService = otpService;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendOtp(
        [FromBody] SendOtpRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(
                ModelState
            );
        }

        var result =
            await _otpService
                .SendVerificationOtpAsync(
                    request
                );

        return Ok(result);
    }

    [HttpPost("verify")]
    public async Task<IActionResult> VerifyOtp(
        [FromBody] VerifyOtpRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(
                ModelState
            );
        }

        var result =
            await _otpService
                .VerifyOtpAsync(
                    request
                );

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }
}