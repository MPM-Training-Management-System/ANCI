using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.DTOs.Training.LearningMaterials;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/learning-materials")]
[Authorize]
public class LearningMaterialsController
    : ControllerBase
{
    private readonly ILearningMaterialService
        _service;

    public LearningMaterialsController(
        ILearningMaterialService service)
    {
        _service = service;
    }

    // =========================================================
    // GET BY BATCH
    // GET /api/learning-materials/batch/{batchId}
    // =========================================================

    [HttpGet("batch/{batchId:guid}")]
    public async Task<
        ActionResult<IReadOnlyList<LearningMaterialDto>>>
        GetByBatch(
            Guid batchId)
    {
        try
        {
            var result =
                await _service.GetByBatchIdAsync(
                    batchId);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // GET BY ID
    // GET /api/learning-materials/{id}
    // =========================================================

    [HttpGet("{id:guid}")]
    public async Task<
        ActionResult<LearningMaterialDto>>
        GetById(
            Guid id)
    {
        try
        {
            var result =
                await _service.GetByIdAsync(id);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // CREATE
    // POST /api/learning-materials
    // =========================================================

    [HttpPost]
    [Authorize(Roles = "Trainer")]
    public async Task<
        ActionResult<LearningMaterialDto>>
        Create(
            [FromBody]
            CreateLearningMaterialRequest request)
    {
        var userIdClaim =
            User.FindFirst(
                ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized(new
            {
                message = "User identity not found."
            });
        }

        if (!Guid.TryParse(
                userIdClaim.Value,
                out var trainerUserId))
        {
            return Unauthorized(new
            {
                message = "Invalid user identity."
            });
        }

        try
        {
            var result =
                await _service.CreateAsync(
                    trainerUserId,
                    request);

            return CreatedAtAction(
                nameof(GetById),
                new
                {
                    id = result.Id
                },
                result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // UPDATE
    // PUT /api/learning-materials/{id}
    // =========================================================

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin, Trainer")]
    public async Task<
        ActionResult<LearningMaterialDto>>
        Update(
            Guid id,
            [FromBody]
            UpdateLearningMaterialRequest request)
    {
        try
        {
            var result =
                await _service.UpdateAsync(
                    id,
                    request);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // DELETE
    // DELETE /api/learning-materials/{id}
    // =========================================================

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin, Trainer")]
    public async Task<IActionResult>
        Delete(
            Guid id)
    {
        try
        {
            await _service.DeleteAsync(id);

            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // PUBLISH
    // PUT /api/learning-materials/{id}/publish
    // =========================================================

    [HttpPut("{id:guid}/publish")]
    [Authorize(Roles = "Admin, Trainer")]
    public async Task<
        ActionResult<LearningMaterialDto>>
        Publish(
            Guid id)
    {
        try
        {
            var result =
                await _service.PublishAsync(id);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // CREATE MODULE
    // POST /api/learning-materials/modules
    // =========================================================

    [HttpPost("modules")]
    [Authorize(Roles = "Admin, Trainer")]
    public async Task<
        ActionResult<LearningModuleDto>>
        CreateModule(
            [FromBody]
            CreateLearningModuleRequest request)
    {
        try
        {
            var result =
                await _service.CreateModuleAsync(
                    request);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // GET MODULES
    // GET /api/learning-materials/{id}/modules
    // =========================================================

    [HttpGet("{id:guid}/modules")]
    [Authorize(Roles = "Admin,Trainer,Participant")]
    public async Task<
        ActionResult<IReadOnlyList<LearningModuleDto>>>
        GetModules(
            Guid id)
    {
        try
        {
            var result =
                await _service.GetModulesAsync(id);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // UPDATE MODULE
    // PUT /api/learning-materials/modules/{moduleId}
    // =========================================================

    [HttpPut("modules/{moduleId:guid}")]
    [Authorize(Roles = "Admin,Trainer")]
    public async Task<
        ActionResult<LearningModuleDto>>
        UpdateModule(
            Guid moduleId,
            [FromBody]
            UpdateLearningModuleRequest request)
    {
        try
        {
            var result =
                await _service.UpdateModuleAsync(
                    moduleId,
                    request);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // DELETE MODULE
    // DELETE /api/learning-materials/modules/{moduleId}
    // =========================================================

    [HttpDelete("modules/{moduleId:guid}")]
    [Authorize(Roles = "Admin,Trainer")]
    public async Task<IActionResult>
        DeleteModule(
            Guid moduleId)
    {
        try
        {
            await _service.DeleteModuleAsync(
                moduleId);

            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // CREATE SECTION
    // POST /api/learning-materials/sections
    // =========================================================

    [HttpPost("sections")]
    [Authorize(Roles = "Admin,Trainer")]
    public async Task<
        ActionResult<LearningSectionDto>>
        CreateSection(
            [FromBody]
            CreateLearningSectionRequest request)
    {
        try
        {
            var result =
                await _service.CreateSectionAsync(
                    request);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // GET SECTIONS
    // GET /api/learning-materials/modules/{moduleId}/sections
    // =========================================================

    [HttpGet(
        "modules/{moduleId:guid}/sections")]
    [Authorize(Roles = "Admin,Trainer,Participant")]
    public async Task<
        ActionResult<IReadOnlyList<LearningSectionDto>>>
        GetSections(
            Guid moduleId)
    {
        try
        {
            var result =
                await _service.GetSectionsAsync(
                    moduleId);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // UPDATE SECTION
    // PUT /api/learning-materials/sections/{sectionId}
    // =========================================================

    [HttpPut(
        "sections/{sectionId:guid}")]
    [Authorize(Roles = "Admin,Trainer")]
    public async Task<
        ActionResult<LearningSectionDto>>
        UpdateSection(
            Guid sectionId,
            [FromBody]
            UpdateLearningSectionRequest request)
    {
        try
        {
            var result =
                await _service.UpdateSectionAsync(
                    sectionId,
                    request);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // DELETE SECTION
    // DELETE /api/learning-materials/sections/{sectionId}
    // =========================================================

    [HttpDelete(
        "sections/{sectionId:guid}")]
    [Authorize(Roles = "Admin, Trainer")]
    public async Task<IActionResult>
        DeleteSection(
            Guid sectionId)
    {
        try
        {
            await _service.DeleteSectionAsync(
                sectionId);

            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // UPLOAD FILE
    // POST /api/learning-materials/{id}/upload
    // =========================================================

    [HttpPost("{id:guid}/upload")]
    [Authorize(Roles = "Admin, Trainer")]
    [Consumes("multipart/form-data")]
    public async Task<
        ActionResult<LearningMaterialDto>>
        UploadFile(
            Guid id,
            [FromForm]
            UploadLearningMaterialRequest request)
    {
        try
        {
            var result =
                await _service.UploadFileAsync(
                    id,
                    request);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // EXTRACT TEXT
    // POST /api/learning-materials/{id}/extract
    // =========================================================

    [HttpPost("{id:guid}/extract")]
    [Authorize(Roles = "Admin, Trainer")]
    public async Task<
        ActionResult<LearningMaterialExtractionDto>>
        ExtractText(
            Guid id)
    {
        try
        {
            var result =
                await _service.ExtractTextAsync(
                    id);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // GENERATE MODULES
    // POST /api/learning-materials/{id}/generate-modules
    // =========================================================

    [HttpPost("{id:guid}/generate-modules")]
    [Authorize(Roles = "Admin, Trainer")]
    public async Task<
        ActionResult<IReadOnlyList<LearningModuleDto>>>
        GenerateModules(
            Guid id)
    {
        try
        {
            var result =
                await _service
                    .GenerateModulesFromDocumentAsync(
                        id);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }
}