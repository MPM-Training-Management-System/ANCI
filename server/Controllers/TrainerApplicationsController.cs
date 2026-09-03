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
    private readonly ITrainerApplicationService _service;


    public TrainerApplicationsController(
        ITrainerApplicationService service)
    {
        _service = service;
    }


    // =========================================================
    // GET MY APPLICATION
    // GET /api/trainer-applications/me
    // =========================================================

    [HttpGet("me")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult>
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
                        "Invalid authenticated user."
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
    // GET APPLICATION BY ID
    // GET /api/trainer-applications/{id}
    // =========================================================

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult>
        GetById(
            Guid id)
    {
        var result =
            await _service.GetByIdAsync(
                id
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

    [HttpPut("me")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult>
        UpdateMyApplication(
            [FromBody]
            UpdateTrainerApplicationRequest request)
    {
        var userId =
            GetCurrentUserId();


        if (userId is null)
        {
            return Unauthorized(
                new
                {
                    message =
                        "Invalid authenticated user."
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


            return Ok(result);
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
    // PUT /api/trainer-applications/me/profile-image
    // =========================================================

    [HttpPut("me/profile-image")]
    [Authorize(Roles = "Trainer")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult>
        UpdateProfileImage(
            IFormFile profileImage)
    {
        var userId =
            GetCurrentUserId();


        if (userId is null)
        {
            return Unauthorized(
                new
                {
                    message =
                        "Invalid authenticated user."
                }
            );
        }


        try
        {
            var result =
                await _service
                    .UpdateProfileImageAsync(
                        userId.Value,
                        profileImage
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
    // UPLOAD DOCUMENT
    // POST /api/trainer-applications/{id}/documents
    // =========================================================

    [HttpPost("{id:guid}/documents")]
    [Authorize(Roles = "Trainer")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult>
        UploadDocument(
            Guid id,
            [FromForm]
            UploadTrainerApplicationDocumentRequest request)
    {
        var userId =
            GetCurrentUserId();


        if (userId is null)
        {
            return Unauthorized(
                new
                {
                    message =
                        "Invalid authenticated user."
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


            return Ok(result);
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


    // =========================================================
    // GET MY DOCUMENTS
    // GET /api/trainer-applications/{id}/documents
    // =========================================================

    [HttpGet("{id:guid}/documents")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult>
        GetMyDocuments(
            Guid id)
    {
        var userId =
            GetCurrentUserId();


        if (userId is null)
        {
            return Unauthorized(
                new
                {
                    message =
                        "Invalid authenticated user."
                }
            );
        }


        try
        {
            var result =
                await _service
                    .GetMyDocumentsAsync(
                        userId.Value,
                        id
                    );


            return Ok(result);
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
    }


    // =========================================================
    // DELETE DOCUMENT
    // DELETE /api/trainer-applications/{id}/documents/{documentId}
    // =========================================================

    [HttpDelete("{id:guid}/documents/{documentId:guid}")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult>
        DeleteDocument(
            Guid id,
            Guid documentId)
    {
        var userId =
            GetCurrentUserId();


        if (userId is null)
        {
            return Unauthorized(
                new
                {
                    message =
                        "Invalid authenticated user."
                }
            );
        }


        try
        {
            await _service
                .DeleteDocumentAsync(
                    userId.Value,
                    id,
                    documentId
                );


            return Ok(
                new
                {
                    success = true,
                    message =
                        "Document deleted successfully."
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


    // =========================================================
    // ADMIN REVIEW APPLICATION
    // PUT /api/trainer-applications/{id}/review
    // =========================================================

    [HttpPut("{id:guid}/review")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult>
        Review(
            Guid id,
            [FromBody]
            ReviewTrainerApplicationRequest request)
    {
        var adminId =
            GetCurrentUserId();


        if (adminId is null)
        {
            return Unauthorized(
                new
                {
                    message =
                        "Invalid authenticated user."
                }
            );
        }


        try
        {
            await _service
                .ReviewAsync(
                    id,
                    adminId.Value,
                    request
                );


            return Ok(
                new
                {
                    success = true,
                    message =
                        "Trainer application reviewed successfully."
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


    // =========================================================
    // ADMIN REVIEW DOCUMENT
    // PUT /api/trainer-applications/{id}/documents/{documentId}/review
    // =========================================================

    [HttpPut(
        "{id:guid}/documents/{documentId:guid}/review"
    )]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult>
        ReviewDocument(
            Guid id,
            Guid documentId,
            [FromBody]
            ReviewTrainerApplicationDocumentRequest request)
    {
        var adminId =
            GetCurrentUserId();


        if (adminId is null)
        {
            return Unauthorized(
                new
                {
                    message =
                        "Invalid authenticated user."
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
                    success = true,
                    message =
                        "Document reviewed successfully."
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


    // =========================================================
    // CURRENT USER ID
    // =========================================================

    private Guid? GetCurrentUserId()
    {
        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );


        if (
            string.IsNullOrWhiteSpace(
                userId
            )
        )
        {
            return null;
        }


        if (
            !Guid.TryParse(
                userId,
                out var parsedUserId
            )
        )
        {
            return null;
        }


        return parsedUserId;
    }

    [HttpGet]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> GetAll()
{
    var result =
        await _service.GetAllAsync();

    return Ok(result);
}
}