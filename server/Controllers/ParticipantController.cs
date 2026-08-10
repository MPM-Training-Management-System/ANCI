using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.DTOs.Participant;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ParticipantController : ControllerBase
{
    private readonly IParticipantService _participantService;

    public ParticipantController(
        IParticipantService participantService)
    {
        _participantService = participantService;
    }

    // ==========================================
    // COMPLETE PARTICIPANT REGISTRATION
    // ==========================================

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromForm] RegisterParticipantDTO dto)
    {
        try
        {
            var participant =
                await _participantService.RegisterAsync(dto);

            return Ok(new
            {
                message =
                    "Participant profile completed successfully.",

                participantId = participant.Id,

                userId = participant.UserId,

                email = participant.User.Email
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // ==========================================
    // GET ALL
    // ==========================================

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var participants =
            await _participantService.GetAllAsync();

        return Ok(participants);
    }

    // ==========================================
    // GET BY ID
    // ==========================================

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var participant =
            await _participantService.GetByIdAsync(id);

        if (participant == null)
        {
            return NotFound(new
            {
                message = "Participant not found."
            });
        }

        return Ok(participant);
    }

    // ==========================================
    // UPDATE
    // ==========================================

    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromForm] UpdateParticipantDTO dto)
    {
        try
        {
            await _participantService.UpdateAsync(
                id,
                dto);

            return Ok(new
            {
                message =
                    "Participant updated successfully."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // ==========================================
    // DELETE
    // ==========================================

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _participantService.DeleteAsync(id);

            return Ok(new
            {
                message =
                    "Participant deleted successfully."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // ==========================================
    // CHANGE STATUS
    // ==========================================

    [Authorize]
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> ChangeStatus(
        Guid id,
        [FromBody] bool isActive)
    {
        try
        {
            await _participantService.ChangeStatusAsync(
                id,
                isActive);

            return Ok(new
            {
                message =
                    "Participant status updated successfully."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }
}