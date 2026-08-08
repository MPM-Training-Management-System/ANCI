using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.DTOs.Trainer;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrainerController : ControllerBase
{
    private readonly ITrainerService _trainerService;

    public TrainerController(ITrainerService trainerService)
    {
        _trainerService = trainerService;
    }

    // ==========================================
    // REGISTER
    // ==========================================

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromForm] RegisterTrainerDTO dto)
    {
        try
        {
            await _trainerService.RegisterAsync(dto);

            return Ok(new
            {
                message = "Trainer registered successfully."
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
        var trainers = await _trainerService.GetAllAsync();

        return Ok(trainers);
    }

    // ==========================================
    // GET BY ID
    // ==========================================

    [Authorize]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var trainer = await _trainerService.GetByIdAsync(id);

        if (trainer == null)
        {
            return NotFound(new
            {
                message = "Trainer not found."
            });
        }

        return Ok(trainer);
    }

    // ==========================================
    // UPDATE
    // ==========================================

    [Authorize]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromForm] UpdateTrainerDTO dto)
    {
        try
        {
            await _trainerService.UpdateAsync(id, dto);

            return Ok(new
            {
                message = "Trainer updated successfully."
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
    // DELETE (SOFT DELETE)
    // ==========================================

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _trainerService.DeleteAsync(id);

            return Ok(new
            {
                message = "Trainer deleted successfully."
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
            await _trainerService.ChangeStatusAsync(
                id,
                isActive);

            return Ok(new
            {
                message = "Trainer status updated successfully."
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
    // VERIFY TRAINER
    // ==========================================

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id:guid}/verify")]
    public async Task<IActionResult> Verify(
        Guid id,
        [FromBody] bool isVerified)
    {
        try
        {
            await _trainerService.VerifyAsync(
                id,
                isVerified);

            return Ok(new
            {
                message = "Trainer verification updated successfully."
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