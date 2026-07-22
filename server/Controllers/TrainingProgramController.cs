using Microsoft.AspNetCore.Mvc;
using server.DTOs.TrainingProgram;
using server.Services.Interfaces;

namespace server.Controllers
{
    [ApiController]
    [Route("api/training-programs")]
    public class TrainingProgramController : ControllerBase
    {
        private readonly ITrainingProgramService _service;

        public TrainingProgramController(ITrainingProgramService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var training = await _service.GetByIdAsync(id);

            if (training == null)
                return NotFound(new
                {
                    message = "Training Program not found."
                });

            return Ok(training);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateTrainingProgramDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var training = await _service.CreateAsync(dto);

            return CreatedAtAction(nameof(GetById),
                new { id = training.Id },
                training);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateTrainingProgramDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var training = await _service.UpdateAsync(id, dto);

            if (training == null)
                return NotFound(new
                {
                    message = "Training Program not found."
                });

            return Ok(training);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
                return NotFound(new
                {
                    message = "Training Program not found."
                });

            return Ok(new
            {
                message = "Training Program deleted successfully."
            });
        }
    }
}