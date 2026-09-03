using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Training;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/training-programs/{trainingProgramId}/documents")]
[Authorize(Roles = "Admin")]
public class TrainingProgramDocumentsController
    : ControllerBase
{
    private readonly ITrainingProgramDocumentService _service;

    public TrainingProgramDocumentsController(
        ITrainingProgramDocumentService service)
    {
        _service = service;
    }


    // =========================================================
    // GET ALL DOCUMENTS
    // =========================================================

    [HttpGet]
    public async Task<
        ActionResult<List<TrainingProgramDocumentDto>>
    > GetAll(
        Guid trainingProgramId)
    {
        var result =
            await _service.GetAllAsync(
                trainingProgramId
            );

        return Ok(result);
    }


    // =========================================================
    // UPLOAD DOCUMENT
    // =========================================================

    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<
        ActionResult<TrainingProgramDocumentDto>
    > Upload(
        Guid trainingProgramId,
        [FromForm]
        UploadTrainingProgramDocumentRequest request)
    {
        var result =
            await _service.UploadAsync(
                trainingProgramId,
                request
            );

        return Ok(result);
    }


    // =========================================================
    // DELETE DOCUMENT
    // =========================================================

    [HttpDelete("{documentId}")]
    public async Task<IActionResult> Delete(
        Guid trainingProgramId,
        Guid documentId)
    {
        await _service.DeleteAsync(
            trainingProgramId,
            documentId
        );

        return NoContent();
    }
}