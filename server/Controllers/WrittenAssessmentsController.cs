using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.DTOs.Assessments;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/written-assessments")]
[Authorize]
public class WrittenAssessmentsController : ControllerBase
{
    private readonly IWrittenAssessmentService _service;
    private readonly IDocumentTextExtractionService _documentTextExtractionService;

    public WrittenAssessmentsController(
        IWrittenAssessmentService service,
        IDocumentTextExtractionService documentTextExtractionService)
    {
        _service = service;
        _documentTextExtractionService = documentTextExtractionService;
    }

    // =========================================================
    // CURRENT USER
    // =========================================================

    private Guid GetCurrentUserId()
    {
        var userId =
            User.FindFirst("sub")?.Value
            ?? User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier
            )?.Value;

        if (!Guid.TryParse(userId, out var parsedUserId))
        {
            throw new UnauthorizedAccessException(
                "User ID claim is missing or invalid.");
        }

        return parsedUserId;
    }

    // =========================================================
    // ADMIN - WRITTEN ASSESSMENT
    // =========================================================

    [HttpGet("batch/{trainingBatchId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IReadOnlyList<WrittenAssessmentDto>>>
        GetByBatchId(Guid trainingBatchId)
    {
        var result =
            await _service.GetByBatchIdAsync(
                trainingBatchId);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<WrittenAssessmentDto>>
        GetById(Guid id)
    {
        var result =
            await _service.GetByIdAsync(id);

        if (result is null)
        {
            return NotFound(new
            {
                message = "Written assessment not found."
            });
        }

        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<WrittenAssessmentDto>>
        Create(
            [FromBody] CreateWrittenAssessmentRequest request)
    {
        var result =
            await _service.CreateAsync(request);

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Id },
            result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<WrittenAssessmentDto>>
        Update(
            Guid id,
            [FromBody] UpdateWrittenAssessmentRequest request)
    {
        var result =
            await _service.UpdateAsync(
                id,
                request);

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult>
        Delete(Guid id)
    {
        await _service.DeleteAsync(id);

        return NoContent();
    }

    [HttpPut("{id:guid}/publish")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<WrittenAssessmentDto>>
        SetPublished(
            Guid id,
            [FromQuery] bool isPublished)
    {
        var result =
            await _service.SetPublishedAsync(
                id,
                isPublished);

        return Ok(result);
    }

    // =========================================================
    // ADMIN - QUESTIONS
    // =========================================================

    [HttpGet("{id:guid}/questions")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<
        IReadOnlyList<AdminAssessmentQuestionDto>>>
        GetQuestions(Guid id)
    {
        var result =
            await _service.GetQuestionsAsync(id);

        return Ok(result);
    }

    [HttpPost("questions")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AdminAssessmentQuestionDto>>
        CreateQuestion(
            [FromBody] CreateAssessmentQuestionRequest request)
    {
        var result =
            await _service.CreateQuestionAsync(
                request);

        return Ok(result);
    }

    [HttpPut("questions/{questionId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AdminAssessmentQuestionDto>>
        UpdateQuestion(
            Guid questionId,
            [FromBody] UpdateAssessmentQuestionRequest request)
    {
        var result =
            await _service.UpdateQuestionAsync(
                questionId,
                request);

        return Ok(result);
    }

    [HttpDelete("questions/{questionId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult>
        DeleteQuestion(Guid questionId)
    {
        await _service.DeleteQuestionAsync(
            questionId);

        return NoContent();
    }

    // =========================================================
    // ADMIN - CHOICES
    // =========================================================

    [HttpPost("choices")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AdminAssessmentChoiceDto>>
        CreateChoice(
            [FromBody] CreateAssessmentChoiceRequest request)
    {
        var result =
            await _service.CreateChoiceAsync(
                request);

        return Ok(result);
    }

    [HttpPut("choices/{choiceId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<AdminAssessmentChoiceDto>>
        UpdateChoice(
            Guid choiceId,
            [FromBody] UpdateAssessmentChoiceRequest request)
    {
        var result =
            await _service.UpdateChoiceAsync(
                choiceId,
                request);

        return Ok(result);
    }

    [HttpDelete("choices/{choiceId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult>
        DeleteChoice(Guid choiceId)
    {
        await _service.DeleteChoiceAsync(
            choiceId);

        return NoContent();
    }

    // =========================================================
    // PARTICIPANT
    // =========================================================

    [HttpGet("{id:guid}/participant")]
    [Authorize(Roles = "Participant")]
    public async Task<ActionResult<ParticipantAssessmentDto>>
        GetParticipantAssessment(Guid id)
    {
        var participantUserId =
            GetCurrentUserId();

        var result =
            await _service.GetParticipantAssessmentAsync(
                participantUserId,
                id);

        if (result is null)
        {
            return NotFound(new
            {
                message =
                    "Written assessment not found or not available."
            });
        }

        return Ok(result);
    }

    [HttpPost("start")]
    [Authorize(Roles = "Participant")]
    public async Task<ActionResult<AssessmentAttemptDto>>
        StartAttempt(
            [FromBody] StartAssessmentRequest request)
    {
        var participantUserId =
            GetCurrentUserId();

        var result =
            await _service.StartAttemptAsync(
                participantUserId,
                request.WrittenAssessmentId);

        return Ok(result);
    }

    // =========================================================
// ADMIN - AI QUESTION GENERATION FROM DOCUMENT
// =========================================================

[HttpPost("{id:guid}/generate-from-document")]
[Authorize(Roles = "Admin")]
[RequestSizeLimit(20_000_000)]
public async Task<ActionResult<
    IReadOnlyList<AdminAssessmentQuestionDto>>>
    GenerateQuestionsFromDocument(
        Guid id,
        IFormFile file,
        [FromQuery] int questionCount = 10,
        CancellationToken cancellationToken = default)
{
    if (file is null || file.Length == 0)
    {
        return BadRequest(new
        {
            message = "A DOCX document is required."
        });
    }

    if (questionCount < 1 || questionCount > 100)
    {
        return BadRequest(new
        {
            message = "Question count must be between 1 and 100."
        });
    }

    var extension =
        Path.GetExtension(file.FileName)
            .ToLowerInvariant();

    if (extension != ".docx")
    {
        return BadRequest(new
        {
            message = "Only DOCX files are supported."
        });
    }

    await using var stream =
        file.OpenReadStream();

    var extractionResult =
        await _documentTextExtractionService.ExtractAsync(
            stream,
            file.FileName,
            file.ContentType);

    if (string.IsNullOrWhiteSpace(
            extractionResult.Text))
    {
        return BadRequest(new
        {
            message =
                "The uploaded document does not contain readable text."
        });
    }

    var result =
        await _service.GenerateQuestionsFromDocumentAsync(
            id,
            extractionResult.Text,
            questionCount,
            extractionResult.Images,
            extractionResult.MediaLinks,
            cancellationToken);

    return Ok(result);
}

    [HttpGet("attempts/{attemptId:guid}")]
    [Authorize(Roles = "Participant")]
    public async Task<ActionResult<AssessmentAttemptDto>>
        GetAttempt(Guid attemptId)
    {
        var participantUserId =
            GetCurrentUserId();

        var result =
            await _service.GetAttemptAsync(
                participantUserId,
                attemptId);

        if (result is null)
        {
            return NotFound(new
            {
                message =
                    "Assessment attempt not found."
            });
        }

        return Ok(result);
    }

    [HttpPost("submit")]
    [Authorize(Roles = "Participant")]
    public async Task<ActionResult<AssessmentResultDto>>
        SubmitAttempt(
            [FromBody] SubmitAssessmentRequest request)
    {
        var participantUserId =
            GetCurrentUserId();

        var result =
            await _service.SubmitAttemptAsync(
                participantUserId,
                request);

        return Ok(result);
    }

    [HttpGet("{id:guid}/results")]
    [Authorize(Roles = "Participant")]
    public async Task<ActionResult<
        IReadOnlyList<AssessmentResultDto>>>
        GetMyResults(Guid id)
    {
        var participantUserId =
            GetCurrentUserId();

        var result =
            await _service.GetMyResultsAsync(
                participantUserId,
                id);

        return Ok(result);
    }

    [HttpGet("batch/{trainingBatchId:guid}/participant")]
[Authorize(Roles = "Participant")]
public async Task<
    ActionResult<IReadOnlyList<ParticipantAssessmentDto>>>
    GetParticipantAssessmentsByBatch(
        Guid trainingBatchId)
{
    var participantUserId =
        GetCurrentUserId();

    var result =
        await _service.GetParticipantAssessmentsByBatchIdAsync(
            participantUserId,
            trainingBatchId);

    return Ok(result);
}
}