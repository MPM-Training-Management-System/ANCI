using System.Security.Claims;

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
    private readonly IIdValidationService _idValidationService;

    public TrainerController(
        ITrainerService trainerService,
        IIdValidationService idValidationService)
    {
        _trainerService = trainerService;
        _idValidationService = idValidationService;
    }

    // =====================================================
    // GET ALL
    // =====================================================

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll()
    {
        var trainers =
            await _trainerService.GetAllAsync();

        return Ok(trainers);
    }

    // =====================================================
    // GET BY ID
    // =====================================================

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> GetById(
        Guid id)
    {
        var trainer =
            await _trainerService.GetByIdAsync(id);

        if (trainer == null)
        {
            return NotFound(new
            {
                message =
                    "Trainer not found."
            });
        }

        return Ok(trainer);
    }

 
    // =====================================================
    // COMPLETE PROFILE
    // =====================================================

    [HttpPost("complete-profile")]
    [Authorize(Roles = "Trainer")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult>
        CompleteProfile(
            [FromForm]
            CompleteTrainerProfileDTO dto)
    {
        try
        {
            // =================================================
            // GET USER ID FROM JWT
            // =================================================

            var userIdClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier
                )?.Value;

            if (string.IsNullOrWhiteSpace(
                    userIdClaim))
            {
                return Unauthorized(new
                {
                    message =
                        "User ID was not found in authentication token."
                });
            }

            // =================================================
            // PARSE USER ID
            // =================================================

            if (!Guid.TryParse(
                    userIdClaim,
                    out var userId))
            {
                return Unauthorized(new
                {
                    message =
                        "Invalid user ID in authentication token."
                });
            }

            // =================================================
            // VALIDATE PROFILE IMAGE
            // =================================================

            if (dto.ProfileImage == null ||
                dto.ProfileImage.Length == 0)
            {
                return BadRequest(new
                {
                    message =
                        "Profile image is required."
                });
            }

            // =================================================
            // VALIDATE VALID ID
            // =================================================

            if (dto.ValidId == null ||
                dto.ValidId.Length == 0)
            {
                return BadRequest(new
                {
                    message =
                        "Valid ID is required."
                });
            }

            // =================================================
            // SUBMIT TRAINER PROFILE
            // =================================================

            var trainer =
                await _trainerService
                    .CompleteProfileAsync(
                        userId,
                        dto
                    );

            // =================================================
            // RESPONSE
            // =================================================

            return Ok(new
            {
                message =
                    "Trainer profile submitted successfully.",

                trainer
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message =
                    ex.Message
            });
        }
    }

    // =====================================================
    // UPDATE
    // =====================================================

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromForm]
        UpdateTrainerDTO dto)
    {
        try
        {
            var trainer =
                await _trainerService
                    .UpdateAsync(
                        id,
                        dto
                    );

            if (trainer == null)
            {
                return NotFound(new
                {
                    message =
                        "Trainer not found."
                });
            }

            return Ok(trainer);
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message =
                    ex.Message
            });
        }
    }

    // =====================================================
    // VERIFY
    // =====================================================

    [HttpPut("{id:guid}/verify")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Verify(
        Guid id,
        [FromBody]
        bool isApproved)
    {
        try
        {
            await _trainerService
                .VerifyAsync(
                    id,
                    isApproved
                );

            return Ok(new
            {
                message =
                    isApproved
                        ? "Trainer approved successfully."
                        : "Trainer rejected successfully."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message =
                    ex.Message
            });
        }
    }

    // =====================================================
    // STATUS
    // =====================================================

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(
        Guid id,
        [FromBody]
        bool isActive)
    {
        try
        {
            var updated =
                await _trainerService
                    .UpdateStatusAsync(
                        id,
                        isActive
                    );

            if (!updated)
            {
                return NotFound(new
                {
                    message =
                        "Trainer not found."
                });
            }

            return Ok(new
            {
                message =
                    isActive
                        ? "Trainer activated successfully."
                        : "Trainer deactivated successfully."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message =
                    ex.Message
            });
        }
    }

    // =====================================================
    // DELETE
    // =====================================================

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(
        Guid id)
    {
        try
        {
            var deleted =
                await _trainerService
                    .DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message =
                        "Trainer not found."
                });
            }

            return Ok(new
            {
                message =
                    "Trainer deactivated successfully."
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message =
                    ex.Message
            });
        }
    }
} 