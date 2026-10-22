using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.DTOs.Training;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/certificate")]
public class CertificateController : ControllerBase
{
    private readonly ICertificateService _service;

    public CertificateController(
        ICertificateService service)
    {
        _service = service;
    }

    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IReadOnlyList<CertificateDto>>>
        GetAll()
    {
        var certificates =
            await _service.GetAllAsync();

        return Ok(certificates);
    }

    [HttpGet("enrollment/{enrollmentId:guid}")]
    [Authorize]
    public async Task<ActionResult<IReadOnlyList<CertificateDto>>>
        GetByEnrollment(Guid enrollmentId)
    {
        var certificates =
            await _service.GetByEnrollmentAsync(enrollmentId);

        return Ok(certificates);
    }

    [HttpPost("generate/{enrollmentId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IReadOnlyList<CertificateDto>>>
        Generate(Guid enrollmentId)
    {
        try
        {
            var certificates =
                await _service.GenerateForEnrollmentAsync(
                    enrollmentId);

            return Ok(certificates);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
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

    // Public verification endpoint.
    [AllowAnonymous]
    [HttpGet("verify/{verificationCode}")]
    public async Task<ActionResult<CertificateDto>>
        Verify(string verificationCode)
    {
        var certificate =
            await _service.GetByVerificationCodeAsync(
                verificationCode);

        if (certificate is null)
        {
            return NotFound(new
            {
                message = "Certificate not found."
            });
        }

        return Ok(certificate);
    }
    [HttpGet("eligible")]
[Authorize(Roles = "Admin")]
public async Task<ActionResult<IReadOnlyList<EligibleCertificateDto>>>
    GetEligible()
{
    var participants =
        await _service.GetEligibleAsync();

    return Ok(participants);
}


    // =========================================================
    // GET MY CERTIFICATES — PARTICIPANT
    // =========================================================

    [HttpGet("my-certificates")]
    [Authorize(Roles = "Participant")]
    public async Task<ActionResult<IReadOnlyList<CertificateDto>>>
        GetMyCertificates()
    {
        var userIdValue =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized(new
            {
                message = "Unable to identify the authenticated user."
            });
        }

        var certificates =
            await _service.GetMyCertificatesAsync(userId);

        return Ok(certificates);
    }

}