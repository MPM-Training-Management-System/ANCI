using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.DTOs.Service;
using server.Services.Service;
using System.Security.Claims;

namespace server.Controllers;

[ApiController]
[Route("api/services/consultations")]
[Authorize(Roles = "Admin")]
public class ServiceConsultationsController : ControllerBase
{
    private readonly IServiceConsultationService _consultationService;

    public ServiceConsultationsController(
        IServiceConsultationService consultationService)
    {
        _consultationService = consultationService;
    }

    // ============================================================
    // CREATE / SCHEDULE CONSULTATION
    // POST: api/services/consultations
    // ============================================================

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateServiceConsultationDto dto)
    {
        try
        {
            var adminUserIdClaim =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                );

            if (!Guid.TryParse(
                    adminUserIdClaim,
                    out var adminUserId))
            {
                return Unauthorized(new
                {
                    message = "Invalid admin identity."
                });
            }

            var consultation =
                await _consultationService.CreateAsync(
                    adminUserId,
                    dto
                );

            if (consultation is null)
            {
                return NotFound(new
                {
                    message =
                        "Service request not found."
                });
            }

            return Ok(consultation);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // ============================================================
    // GET ALL CONSULTATIONS
    // GET: api/services/consultations
    // ============================================================

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var consultations =
            await _consultationService.GetAllAsync();

        return Ok(consultations);
    }

    // ============================================================
    // GET CONSULTATION BY ID
    // GET: api/services/consultations/{id}
    // ============================================================

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(
        Guid id)
    {
        var consultation =
            await _consultationService.GetByIdAsync(id);

        if (consultation is null)
        {
            return NotFound(new
            {
                message =
                    "Consultation not found."
            });
        }

        return Ok(consultation);
    }

    // ============================================================
    // UPDATE CONSULTATION
    // PUT: api/services/consultations/{id}
    // ============================================================

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateServiceConsultationDto dto)
    {
        try
        {
            var consultation =
                await _consultationService.UpdateAsync(
                    id,
                    dto
                );

            if (consultation is null)
            {
                return NotFound(new
                {
                    message =
                        "Consultation not found."
                });
            }

            return Ok(consultation);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }
}