using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Training;
using server.Interfaces.Training;

namespace server.Controllers;

[ApiController]
[Route("api/training-programs")]
[Authorize(Roles = "Admin")]
public class TrainingProgramsController : ControllerBase
{
    private readonly ITrainingProgramService _service;

    public TrainingProgramsController(
        ITrainingProgramService service)
    {
        _service = service;
    }


    // =========================================================
    // GET ALL
    // GET /api/training-programs
    // =========================================================

    [HttpGet]
    public async Task<
        ActionResult<IEnumerable<TrainingProgramDto>>
    > GetAll()
    {
        var result =
            await _service.GetAllAsync();

        return Ok(result);
    }


    // =========================================================
    // GET BY ID
    // GET /api/training-programs/{id}
    // =========================================================

    [HttpGet("{id:guid}")]
    public async Task<
        ActionResult<TrainingProgramDto>
    > GetById(Guid id)
    {
        var result =
            await _service.GetByIdAsync(id);

        if (result is null)
        {
            return NotFound(
                new
                {
                    message =
                        "Training program not found."
                }
            );
        }

        return Ok(result);
    }


    // =========================================================
    // CREATE
    // POST /api/training-programs
    // =========================================================

    [HttpPost]
    public async Task<
        ActionResult<TrainingProgramDto>
    > Create(
        CreateTrainingProgramRequest request)
    {
        var result =
            await _service.CreateAsync(
                request
            );

        return CreatedAtAction(
            nameof(GetById),
            new
            {
                id = result.Id
            },
            result
        );
    }




    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateTrainingProgramRequest request)
    {
        await _service.UpdateAsync(
            id,
            request
        );

        return NoContent();
    }


    // =========================================================
    // DELETE
    // DELETE /api/training-programs/{id}
    // =========================================================

   [HttpDelete("{id:guid}")]
public async Task<IActionResult> Delete(Guid id)
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
    catch (InvalidOperationException ex)
    {
        return Conflict(new
        {
            message = ex.Message
        });
    }
}
}