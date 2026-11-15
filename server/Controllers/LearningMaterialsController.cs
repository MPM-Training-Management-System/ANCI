
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Trainer.Learning;
using server.DTOs.Training.LearningMaterials;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/learning-materials")]
[Authorize]
public class LearningMaterialsController : ControllerBase
{
    private readonly ILearningMaterialService _service;

    public LearningMaterialsController(
        ILearningMaterialService service)
    {
        _service = service;
    }

    // =========================================================
    // LEARNING MATERIALS
    // =========================================================

    // GET: api/learning-materials/batch/{batchId}
    // ADMIN / TRAINER / PARTICIPANT

    [HttpGet("batch/{batchId:guid}")]
    [Authorize(Roles = "Admin,Trainer,Participant")]
    public async Task<IActionResult> GetByBatchId(Guid batchId)
    {
        try
        {
            var result = await _service.GetByBatchIdAsync(batchId);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET: api/learning-materials/{id}
    // ADMIN / TRAINER / PARTICIPANT

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin,Trainer,Participant")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await _service.GetByIdAsync(id);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // =========================================================
    // ADMIN: CREATE / UPDATE / DELETE
    // =========================================================

    // POST: api/learning-materials

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(
        [FromBody] CreateLearningMaterialRequest request)
    {
        try
        {
            var result = await _service.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Id },
                result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PUT: api/learning-materials/{id}

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateLearningMaterialRequest request)
    {
        try
        {
            var result = await _service.UpdateAsync(id, request);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // DELETE: api/learning-materials/{id}

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _service.DeleteAsync(id);

            return Ok(new
            {
                message = "Learning material deleted successfully."
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // =========================================================
    // ADMIN: PUBLISH
    // =========================================================

    // PUT: api/learning-materials/{id}/publish

    [HttpPut("{id:guid}/publish")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Publish(Guid id)
    {
        try
        {
            var result = await _service.PublishAsync(id);

            return Ok(new
            {
                message = "Learning material published successfully.",
                data = result
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // =========================================================
    // ADMIN: UPLOAD MAIN SOURCE FILE
    // =========================================================

    // POST: api/learning-materials/{id}/upload

    [HttpPost("{id:guid}/upload")]
    [Authorize(Roles = "Admin")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadFile(
        Guid id,
        [FromForm] UploadLearningMaterialRequest request)
    {
        try
        {
            var result = await _service.UploadFileAsync(id, request);

            return Ok(new
            {
                message = "Learning material file uploaded successfully.",
                data = result
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // =========================================================
    // ADMIN: EXTRACT MAIN SOURCE FILE
    // =========================================================

    // POST: api/learning-materials/{id}/extract

    [HttpPost("{id:guid}/extract")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ExtractText(Guid id)
    {
        try
        {
            var result = await _service.ExtractTextAsync(id);

            return Ok(new
            {
                message = "Learning material text extracted successfully.",
                data = result
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(502, new
            {
                message = "Unable to retrieve the source file.",
                error = ex.Message
            });
        }
    }

    // =========================================================
    // TRAINER: MODULES
    // =========================================================

    // POST: api/learning-materials/modules

    [HttpPost("modules")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> CreateModule(
        [FromBody] CreateLearningModuleRequest request)
    {
        try
        {
            var result = await _service.CreateModuleAsync(request);

            return Ok(new
            {
                message = "Learning module created successfully.",
                data = result
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PUT: api/learning-materials/modules/{moduleId}

    [HttpPut("modules/{moduleId:guid}")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> UpdateModule(
        Guid moduleId,
        [FromBody] UpdateLearningModuleRequest request)
    {
        try
        {
            var result = await _service.UpdateModuleAsync(
                moduleId,
                request);

            return Ok(new
            {
                message = "Learning module updated successfully.",
                data = result
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET: api/learning-materials/{learningMaterialId}/modules

    [HttpGet("{learningMaterialId:guid}/modules")]
    [Authorize(Roles = "Admin,Trainer,Participant")]
    public async Task<IActionResult> GetModules(
        Guid learningMaterialId)
    {
        try
        {
            var result = await _service.GetModulesAsync(
                learningMaterialId);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // DELETE: api/learning-materials/modules/{moduleId}

    [HttpDelete("modules/{moduleId:guid}")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> DeleteModule(Guid moduleId)
    {
        try
        {
            await _service.DeleteModuleAsync(moduleId);

            return Ok(new
            {
                message = "Learning module deleted successfully."
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // =========================================================
    // TRAINER: MODULE SUPPORTING FILES
    // =========================================================

    // POST: api/learning-materials/modules/{moduleId}/files

    [HttpPost("modules/{moduleId:guid}/files")]
    [Authorize(Roles = "Trainer")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadModuleFile(
        Guid moduleId,
        IFormFile file)
    {
        try
        {
            var result = await _service.UploadModuleFileAsync(
                moduleId,
                file);

            return Ok(new
            {
                message = "Module supporting file uploaded successfully.",
                data = result
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST: api/learning-materials/module-files/{moduleFileId}/extract

    [HttpPost("module-files/{moduleFileId:guid}/extract")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> ExtractModuleFileText(
        Guid moduleFileId)
    {
        try
        {
            var result = await _service.ExtractModuleFileTextAsync(
                moduleFileId);

            return Ok(new
            {
                message = "Module file text extracted successfully.",
                data = result
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(502, new
            {
                message = "Unable to retrieve the module file.",
                error = ex.Message
            });
        }
    }

    // POST: api/learning-materials/modules/{moduleId}/extract-all

    [HttpPost("modules/{moduleId:guid}/extract-all")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> ExtractAllModuleFiles(
        Guid moduleId)
    {
        try
        {
            var result = await _service.ExtractAllModuleFilesAsync(
                moduleId);

            if (!result)
            {
                return NotFound(new
                {
                    message = "No supporting files were found in this module."
                });
            }

            return Ok(new
            {
                message = "All module files were extracted successfully."
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(502, new
            {
                message = "Unable to retrieve one or more module files.",
                error = ex.Message
            });
        }
    }

    // =========================================================
    // TRAINER: LESSONS / SECTIONS
    // =========================================================

    // POST: api/learning-materials/sections

    [HttpPost("sections")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> CreateSection(
        [FromBody] CreateLearningSectionRequest request)
    {
        try
        {
            var result = await _service.CreateSectionAsync(request);

            return Ok(new
            {
                message = "Lesson created successfully.",
                data = result
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PUT: api/learning-materials/sections/{sectionId}

    [HttpPut("sections/{sectionId:guid}")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> UpdateSection(
        Guid sectionId,
        [FromBody] UpdateLearningSectionRequest request)
    {
        try
        {
            var result = await _service.UpdateSectionAsync(
                sectionId,
                request);

            return Ok(new
            {
                message = "Lesson updated successfully.",
                data = result
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET: api/learning-materials/modules/{moduleId}/sections

    [HttpGet("modules/{moduleId:guid}/sections")]
    [Authorize(Roles = "Admin,Trainer,Participant")]
    public async Task<IActionResult> GetSections(Guid moduleId)
    {
        try
        {
            var result = await _service.GetSectionsAsync(moduleId);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    // DELETE: api/learning-materials/sections/{sectionId}

    [HttpDelete("sections/{sectionId:guid}")]
    [Authorize(Roles = "Trainer")]
    public async Task<IActionResult> DeleteSection(Guid sectionId)
    {
        try
        {
            await _service.DeleteSectionAsync(sectionId);

            return Ok(new
            {
                message = "Lesson deleted successfully."
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
