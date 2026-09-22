using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.DTOs.Training;
using server.Services.Training;

namespace server.Controllers;

[ApiController]
[Route("api/training-grade")]
[Authorize(Roles = "Admin,Trainer")]
public class TrainingGradeController : ControllerBase
{
    private readonly ITrainingGradeService _service;

    public TrainingGradeController(ITrainingGradeService service)
    {
        _service = service;
    }


    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IReadOnlyList<TrainingGradeDto>>> GetAll()
    {
        var grades = await _service.GetAllAsync();

        return Ok(grades);
    }


    [HttpGet("enrollment/{enrollmentId:guid}")]
    public async Task<ActionResult<TrainingGradeDto>> GetByEnrollment(
        Guid enrollmentId)
    {
        var result = await _service.GetByEnrollmentAsync(enrollmentId);

        if (result is null)
        {
            return NotFound(new
            {
                message = "Enrollment not found."
            });
        }

        return Ok(result);
    }
}
