using System.Security.Claims;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Enrollment;
using server.Interfaces.Enrollment;

namespace server.Controllers;

[ApiController]
[Route("api/enrollments/{enrollmentId:guid}/documents")]
[Authorize]
public class EnrollmentDocumentsController : ControllerBase
{
    private readonly IEnrollmentDocumentService _service;

    public EnrollmentDocumentsController(
        IEnrollmentDocumentService service)
    {
        _service = service;
    }


    // =========================================================
    // POST
    // /api/enrollments/{enrollmentId}/documents
    //
    // PARTICIPANT ONLY
    // =========================================================

    [HttpPost]
    [Authorize(Roles = "Participant")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<EnrollmentDocumentDto>> Upload(
        Guid enrollmentId,
        [FromForm] UploadEnrollmentDocumentRequest request)
    {
        var userId = GetCurrentUserId();

        var result =
            await _service.UploadAsync(
                enrollmentId,
                userId,
                request
            );

        return Ok(result);
    }


    // =========================================================
    // GET
    // /api/enrollments/{enrollmentId}/documents
    //
    // PARTICIPANT ONLY
    // =========================================================

    [HttpGet]
    [Authorize(Roles = "Participant")]
    public async Task<
        ActionResult<IEnumerable<EnrollmentDocumentDto>>
    > GetDocuments(
        Guid enrollmentId)
    {
        var userId = GetCurrentUserId();

        var result =
            await _service.GetByEnrollmentAsync(
                enrollmentId,
                userId
            );

        return Ok(result);
    }


    // =========================================================
    // DELETE
    // /api/enrollments/{enrollmentId}/documents/{documentId}
    //
    // PARTICIPANT ONLY
    // =========================================================

    [HttpDelete("{documentId:guid}")]
    [Authorize(Roles = "Participant")]
    public async Task<IActionResult> Delete(
        Guid enrollmentId,
        Guid documentId)
    {
        var userId = GetCurrentUserId();

        await _service.DeleteAsync(
            enrollmentId,
            userId,
            documentId
        );

        return NoContent();
    }


    // =========================================================
    // PUT
    // /api/enrollments/{enrollmentId}/documents/{documentId}/review
    //
    // ADMIN ONLY
    // =========================================================

    [HttpPut("{documentId:guid}/review")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Review(
        Guid enrollmentId,
        Guid documentId,
        [FromBody] ReviewEnrollmentDocumentRequest request)
    {
        var adminUserId = GetCurrentUserId();

        await _service.ReviewAsync(
            enrollmentId,
            documentId,
            adminUserId,
            request
        );

        return NoContent();
    }


    // =========================================================
    // GET CURRENT USER ID FROM JWT
    // =========================================================

    private Guid GetCurrentUserId()
    {
        var claim =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

        if (
            string.IsNullOrWhiteSpace(claim) ||
            !Guid.TryParse(claim, out var userId)
        )
        {
            throw new UnauthorizedAccessException(
                "User ID was not found in the authentication token."
            );
        }

        return userId;
    }

    // =========================================================
// GET
// /api/enrollments/{enrollmentId}/documents/admin
//
// ADMIN ONLY
// Gets documents submitted for an enrollment.
// =========================================================

[HttpGet("admin")]
[Authorize(Roles = "Admin")]
public async Task<
    ActionResult<IEnumerable<EnrollmentDocumentDto>>
> GetDocumentsForAdmin(
    Guid enrollmentId)
{
    var result =
        await _service.GetByEnrollmentForAdminAsync(
            enrollmentId
        );

    return Ok(result);
}
}