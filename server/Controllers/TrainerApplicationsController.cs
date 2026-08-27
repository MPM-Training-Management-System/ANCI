using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Trainer;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/trainer-applications")]
[Authorize]
public class TrainerApplicationsController
    : ControllerBase
{
    private readonly ITrainerApplicationService
        _service;


    public TrainerApplicationsController(
        ITrainerApplicationService service)
    {
        _service = service;
    }


    // =========================================================
    // GET MY APPLICATION
    // GET /api/trainer-applications/me
    // =========================================================

    [Authorize(Roles = "Trainer")]
    [HttpGet("me")]
    public async Task<ActionResult<TrainerApplicationDto>>
        GetMyApplication()
    {
        var userId =
            GetCurrentUserId();


        if (userId is null)
        {
            return Unauthorized(
                new
                {
                    message =
                        "User identity was not found."
                }
            );
        }


        var result =
            await _service
                .GetMyApplicationAsync(
                    userId.Value
                );


        if (result is null)
        {
            return NotFound(
                new
                {
                    message =
                        "Trainer application not found."
                }
            );
        }


        return Ok(result);
    }


    // =========================================================
    // UPDATE MY APPLICATION
    // PUT /api/trainer-applications/me
    // =========================================================

    [Authorize(Roles = "Trainer")]
    [HttpPut("me")]
    public async Task<ActionResult<TrainerApplicationDto>>
        UpdateMyApplication(
            [FromBody]
            UpdateTrainerApplicationRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(
                ModelState
            );
        }


        var userId =
            GetCurrentUserId();


        if (userId is null)
        {
            return Unauthorized(
                new
                {
                    message =
                        "User identity was not found."
                }
            );
        }


        try
        {
            var result =
                await _service
                    .UpdateMyApplicationAsync(
                        userId.Value,
                        request
                    );


            if (result is null)
            {
                return NotFound(
                    new
                    {
                        message =
                            "Trainer application not found."
                    }
                );
            }


            return Ok(
                new
                {
                    message =
                        "Trainer application updated successfully.",

                    application =
                        result
                }
            );
        }
        catch (
            InvalidOperationException ex)
        {
            return BadRequest(
                new
                {
                    message =
                        ex.Message
                }
            );
        }
    }


    // =========================================================
    // UPDATE PROFILE IMAGE
    // PUT /api/trainer-applications/me/image
    // =========================================================

    [Authorize(Roles = "Trainer")]
    [HttpPut("me/image")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<TrainerApplicationDto>>
        UpdateProfileImage(
            [FromForm]
            UpdateTrainerApplicationImageRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(
                ModelState
            );
        }


        var userId =
            GetCurrentUserId();


        if (userId is null)
        {
            return Unauthorized(
                new
                {
                    message =
                        "User identity was not found."
                }
            );
        }


        try
        {
            var result =
                await _service
                    .UpdateProfileImageAsync(
                        userId.Value,
                        request.ProfileImage
                    );


            if (result is null)
            {
                return NotFound(
                    new
                    {
                        message =
                            "Trainer application not found."
                    }
                );
            }


            return Ok(
                new
                {
                    message =
                        "Trainer profile image updated successfully.",

                    application =
                        result
                }
            );
        }
        catch (
            InvalidOperationException ex)
        {
            return BadRequest(
                new
                {
                    message =
                        ex.Message
                }
            );
        }
    }


    // =========================================================
    // GET BY ID
    // =========================================================

    [Authorize(Roles = "Admin,Trainer")]
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TrainerApplicationDto>>
        GetById(
            Guid id)
    {
        var result =
            await _service
                .GetByIdAsync(id);


        if (result is null)
        {
            return NotFound(
                new
                {
                    message =
                        "Trainer application not found."
                }
            );
        }


        return Ok(result);
    }


    // =========================================================
    // CURRENT USER ID
    // =========================================================

    private Guid? GetCurrentUserId()
    {
        var userIdClaim =
            User.FindFirst(
                ClaimTypes.NameIdentifier
            )?.Value;


        if (
            string.IsNullOrWhiteSpace(
                userIdClaim
            )
        )
        {
            return null;
        }


        if (
            !Guid.TryParse(
                userIdClaim,
                out var userId
            )
        )
        {
            return null;
        }


        return userId;
    }
    // =========================================================
// UPLOAD DOCUMENT
// POST /api/trainer-applications/{id}/documents
// =========================================================

[Authorize(Roles = "Trainer")]
[HttpPost("{id:guid}/documents")]
[Consumes("multipart/form-data")]
public async Task<ActionResult<TrainerApplicationDocumentDto>>
    UploadDocument(
        Guid id,
        [FromForm]
        UploadTrainerApplicationDocumentRequest request)
{
    if (!ModelState.IsValid)
    {
        return ValidationProblem(
            ModelState
        );
    }


    var userId =
        GetCurrentUserId();


    if (userId is null)
    {
        return Unauthorized(
            new
            {
                message =
                    "User identity was not found."
            }
        );
    }


    try
    {
        var result =
            await _service
                .UploadDocumentAsync(
                    userId.Value,
                    id,
                    request
                );


        return StatusCode(
            StatusCodes.Status201Created,
            result
        );
    }
    catch (
        KeyNotFoundException ex)
    {
        return NotFound(
            new
            {
                message = ex.Message
            }
        );
    }
    catch (
        InvalidOperationException ex)
    {
        return BadRequest(
            new
            {
                message = ex.Message
            }
        );
    }
}
// =========================================================
// ADMIN REVIEW DOCUMENT
// PUT /api/trainer-applications/{id}/documents/{documentId}/review
// =========================================================

[Authorize(Roles = "Admin")]
[HttpPut(
    "{id:guid}/documents/{documentId:guid}/review"
)]
public async Task<IActionResult>
    ReviewDocument(
        Guid id,
        Guid documentId,
        [FromBody]
        ReviewTrainerApplicationDocumentRequest request)
{
    if (!ModelState.IsValid)
    {
        return ValidationProblem(
            ModelState
        );
    }


    var adminId =
        GetCurrentUserId();


    if (adminId is null)
    {
        return Unauthorized(
            new
            {
                message =
                    "Admin identity was not found."
            }
        );
    }


    try
    {
        await _service
            .ReviewDocumentAsync(
                id,
                documentId,
                adminId.Value,
                request
            );


        return Ok(
            new
            {
                message =
                    "Trainer application document reviewed successfully."
            }
        );
    }
    catch (
        KeyNotFoundException ex)
    {
        return NotFound(
            new
            {
                message =
                    ex.Message
            }
        );
    }
    catch (
        InvalidOperationException ex)
    {
        return BadRequest(
            new
            {
                message =
                    ex.Message
            }
        );
    }
}
}