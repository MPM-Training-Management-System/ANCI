using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Training.LearningMaterials;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/learning-progress")]
[Authorize(Roles = "Participant")]
public class LearningProgressController
    : ControllerBase
{
    private readonly ILearningProgressService _service;

    public LearningProgressController(
        ILearningProgressService service)
    {
        _service = service;
    }


    // =========================================================
    // GET MATERIAL PROGRESS
    //
    // GET
    // /api/learning-progress/material/{materialId}
    // =========================================================

    [HttpGet("material/{materialId:guid}")]
    public async Task<
        ActionResult<LearningMaterialProgressDto>>
        GetMaterialProgress(
            Guid materialId)
    {
        var userId =
            GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var result =
                await _service
                    .GetMaterialProgressAsync(
                        userId.Value,
                        materialId);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(
                new
                {
                    message = ex.Message
                });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new
                {
                    message = ex.Message
                });
        }
    }


    // =========================================================
    // MARK SECTION AS READ
    //
    // POST
    // /api/learning-progress/sections/{sectionId}/complete
    // =========================================================

    [HttpPost(
        "sections/{sectionId:guid}/complete")]
    public async Task<
        ActionResult<LearningMaterialProgressDto>>
        MarkSectionAsRead(
            Guid sectionId)
    {
        var userId =
            GetCurrentUserId();

        if (userId is null)
        {
            return Unauthorized();
        }

        try
        {
            var result =
                await _service
                    .MarkSectionAsReadAsync(
                        userId.Value,
                        sectionId);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(
                new
                {
                    message = ex.Message
                });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new
                {
                    message = ex.Message
                });
        }
    }


    // =========================================================
    // CURRENT USER
    // =========================================================

    private Guid? GetCurrentUserId()
    {
        var claim =
            User.FindFirst(
                ClaimTypes.NameIdentifier);

        if (claim is null)
        {
            return null;
        }

        return Guid.TryParse(
            claim.Value,
            out var userId)
            ? userId
            : null;
    }
}