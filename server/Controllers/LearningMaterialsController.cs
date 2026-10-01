using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Trainer.Learning;
using server.DTOs.Training.LearningMaterials;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/learning-materials")]
[Authorize]
public class LearningMaterialsController
    : ControllerBase
{
    private readonly ILearningMaterialService _service;

    public LearningMaterialsController(
        ILearningMaterialService service)
    {
        _service = service;
    }

    // =========================================================
    // GET LEARNING MATERIALS BY TRAINING BATCH
    //
    // GET
    // /api/learning-materials/batch/{batchId}
    //
    // ADMIN
    // TRAINER
    // PARTICIPANT
    // =========================================================

    [HttpGet("batch/{batchId:guid}")]
    [Authorize(
        Roles = "Admin,Trainer,Participant")]
    public async Task<
        ActionResult<
            IReadOnlyList<LearningMaterialDto>>>
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
    // GET LEARNING MATERIAL BY ID
    //
    // GET
    // /api/learning-materials/{id}
    // =========================================================

    [HttpGet("{id:guid}")]
    [Authorize(
        Roles = "Admin,Trainer,Participant")]
    public async Task<
        ActionResult<LearningMaterialDto>>
        GetById(
            Guid id)
    {
        try
        {
            var result =
                await _service.GetByIdAsync(
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
    }

    // =========================================================
    // CREATE LEARNING MATERIAL
    //
    // ADMIN ONLY
    //
    // POST
    // /api/learning-materials
    // =========================================================

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<
        ActionResult<LearningMaterialDto>>
        Create(
            [FromBody]
            CreateLearningMaterialRequest request)
    {
        try
        {
            var result =
                await _service.CreateAsync(
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
    // UPDATE LEARNING MATERIAL
    //
    // ADMIN ONLY
    //
    // PUT
    // /api/learning-materials/{id}
    // =========================================================

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
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
    // DELETE LEARNING MATERIAL
    //
    // ADMIN ONLY
    //
    // DELETE
    // /api/learning-materials/{id}
    // =========================================================

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult>
        Delete(
            Guid id)
    {
        try
        {
            await _service.DeleteAsync(
                id);

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
    // PUBLISH LEARNING MATERIAL
    //
    // ADMIN ONLY
    //
    // PUT
    // /api/learning-materials/{id}/publish
    // =========================================================

    [HttpPut("{id:guid}/publish")]
    [Authorize(Roles = "Admin")]
    public async Task<
        ActionResult<LearningMaterialDto>>
        Publish(
            Guid id)
    {
        try
        {
            var result =
                await _service.PublishAsync(
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
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // UPLOAD MAIN LEARNING MATERIAL
    //
    // ADMIN ONLY
    //
    // POST
    // /api/learning-materials/{id}/upload
    // =========================================================

    [HttpPost("{id:guid}/upload")]
    [Authorize(Roles = "Admin")]
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
            if (request.File == null ||
                request.File.Length == 0)
            {
                return BadRequest(new
                {
                    message =
                        "A source file is required."
                });
            }

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
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =========================================================
    // EXTRACT MAIN LEARNING MATERIAL
    //
    // ADMIN ONLY
    //
    // POST
    // /api/learning-materials/{id}/extract
    // =========================================================

    [HttpPost("{id:guid}/extract")]
    [Authorize(Roles = "Admin")]
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
    // CREATE MODULE
    //
    // TRAINER ONLY
    //
    // POST
    // /api/learning-materials/modules
    // =========================================================

    [HttpPost("modules")]
    [Authorize(Roles = "Trainer")]
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
    //
    // ADMIN
    // TRAINER
    // PARTICIPANT
    //
    // GET
    // /api/learning-materials/{id}/modules
    // =========================================================

    [HttpGet("{id:guid}/modules")]
    [Authorize(
        Roles = "Admin,Trainer,Participant")]
    public async Task<
        ActionResult<
            IReadOnlyList<LearningModuleDto>>>
        GetModules(
            Guid id)
    {
        try
        {
            var result =
                await _service.GetModulesAsync(
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
    }

    // =========================================================
    // UPDATE MODULE
    //
    // TRAINER ONLY
    //
    // PUT
    // /api/learning-materials/modules/{moduleId}
    // =========================================================

    [HttpPut(
        "modules/{moduleId:guid}")]
    [Authorize(Roles = "Trainer")]
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
    //
    // TRAINER ONLY
    // =========================================================

    [HttpDelete(
        "modules/{moduleId:guid}")]
    [Authorize(Roles = "Trainer")]
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
    // UPLOAD MODULE FILE
    //
    // TRAINER ONLY
    //
    // POST
    // /api/learning-materials/modules/{moduleId}/files
    // =========================================================

    [HttpPost(
        "modules/{moduleId:guid}/files")]
    [Authorize(Roles = "Trainer")]
    [Consumes("multipart/form-data")]
    public async Task<
        ActionResult<LearningModuleFileDto>>
        UploadModuleFile(
            Guid moduleId,
            [FromForm]
            UploadLearningModuleRequest request)
    {
        try
        {
            if (request.File == null ||
                request.File.Length == 0)
            {
                return BadRequest(new
                {
                    message =
                        "A module file is required."
                });
            }

            var result =
                await _service.UploadModuleFileAsync(
                    moduleId,
                    request.File);

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
    // EXTRACT MODULE FILE
    // =========================================================

    [HttpPost(
        "modules/{moduleId:guid}/files/{fileId:guid}/extract")]
    [Authorize(Roles = "Trainer")]
    public async Task<
        ActionResult<LearningModuleFileExtractionDto>>
        ExtractModuleFileText(
            Guid moduleId,
            Guid fileId)
    {
        try
        {
            var result =
                await _service.ExtractModuleFileTextAsync(
                    fileId);

            if (result.LearningModuleId !=
                moduleId)
            {
                return BadRequest(new
                {
                    message =
                        "The module file does not belong to the specified module."
                });
            }

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
    // EXTRACT ALL MODULE FILES
    // =========================================================

    [HttpPost(
        "modules/{moduleId:guid}/extract")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult>
        ExtractAllModuleFiles(
            Guid moduleId)
    {
        try
        {
            var result =
                await _service.ExtractAllModuleFilesAsync(
                    moduleId);

            return Ok(new
            {
                success = result,

                message = result
                    ? "All module files were extracted successfully."
                    : "No module files were available."
            });
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
    // GENERATE AI MODULE CONTENT
    //
    // TRAINER ONLY
    //
    // AI generates lessons inside the existing module.
    // =========================================================

    [HttpPost(
        "modules/{moduleId:guid}/generate-ai")]
    [Authorize(Roles = "Trainer")]
    public async Task<
        ActionResult<LearningModuleDto>>
        GenerateModuleAiContent(
            Guid moduleId)
    {
        try
        {
            var result =
                await _service
                    .GenerateModuleAiContentAsync(
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
    // CREATE LESSON / SECTION
    //
    // TRAINER ONLY
    //
    // POST
    // /api/learning-materials/sections
    // =========================================================

    [HttpPost("sections")]
    [Authorize(Roles = "Trainer")]
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
    // GET LESSONS
    //
    // GET
    // /api/learning-materials/modules/{moduleId}/sections
    // =========================================================

    [HttpGet(
        "modules/{moduleId:guid}/sections")]
    [Authorize(
        Roles = "Admin,Trainer,Participant")]
    public async Task<
        ActionResult<
            IReadOnlyList<LearningSectionDto>>>
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
    // UPDATE LESSON
    // =========================================================

    [HttpPut(
        "sections/{sectionId:guid}")]
    [Authorize(Roles = "Trainer")]
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
    // DELETE LESSON
    // =========================================================

    [HttpDelete(
        "sections/{sectionId:guid}")]
    [Authorize(Roles = "Trainer")]
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
}