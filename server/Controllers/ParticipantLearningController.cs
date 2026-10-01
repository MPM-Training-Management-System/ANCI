using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Participant.Learning;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/participant/learning")]
[Authorize(Roles = "Participant")]
public class ParticipantLearningController : ControllerBase
{
    private readonly IParticipantLearningService _service;

    public ParticipantLearningController(
        IParticipantLearningService service)
    {
        _service = service;
    }

    // =========================================================
    // GET LEARNING MATERIAL
    // =========================================================
    //
    // GET:
    // /api/participant/learning/materials/{learningMaterialId}
    //
    // Returns:
    // - Learning material information
    // - Original extracted document content
    // - Modules
    // - AI Welcome
    // - Learning Objectives
    // - Trainer-created Sections
    // - AI Summary
    // - AI Key Takeaways
    // =========================================================

    [HttpGet("materials/{learningMaterialId:guid}")]
    public async Task<ActionResult<ParticipantLearningMaterialDto>>
        GetLearningMaterial(
            Guid learningMaterialId)
    {
        try
        {
            var participantUserId =
                GetCurrentUserId();

            var result =
                await _service.GetLearningMaterialAsync(
                    learningMaterialId,
                    participantUserId);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new
            {
                message =
                    "User ID was not found in the authentication token."
            });
        }
    }

    // =========================================================
    // GET MODULE
    // =========================================================
    //
    // GET:
    // /api/participant/learning/modules/{moduleId}
    // =========================================================

    [HttpGet("modules/{moduleId:guid}")]
    public async Task<ActionResult<ParticipantLearningModuleDto>>
        GetModule(
            Guid moduleId)
    {
        try
        {
            var participantUserId =
                GetCurrentUserId();

            var result =
                await _service.GetModuleAsync(
                    moduleId,
                    participantUserId);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new
            {
                message =
                    "User ID was not found in the authentication token."
            });
        }
    }

    // =========================================================
    // GET SECTION
    // =========================================================
    //
    // GET:
    // /api/participant/learning/sections/{sectionId}
    // =========================================================

    [HttpGet("sections/{sectionId:guid}")]
    public async Task<ActionResult<ParticipantLearningSectionDto>>
        GetSection(
            Guid sectionId)
    {
        try
        {
            var participantUserId =
                GetCurrentUserId();

            var result =
                await _service.GetSectionAsync(
                    sectionId,
                    participantUserId);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new
            {
                message =
                    "User ID was not found in the authentication token."
            });
        }
    }

    // =========================================================
    // GET CURRENT USER ID
    // =========================================================

    private Guid GetCurrentUserId()
    {
        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new UnauthorizedAccessException(
                "User ID was not found in the authentication token.");
        }

        if (!Guid.TryParse(
                userId,
                out var parsedUserId))
        {
            throw new UnauthorizedAccessException(
                "Invalid user ID in the authentication token.");
        }

        return parsedUserId;
    }
}