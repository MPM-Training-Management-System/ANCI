using Microsoft.AspNetCore.Mvc;
using server.DTOs.TrainingSchedule;
using server.Services.Interfaces;

namespace server.Controllers
{
    [ApiController]
    [Route("api/training-schedules")]
    public class TrainingScheduleController : ControllerBase
    {
        private readonly ITrainingScheduleService _service;

        public TrainingScheduleController(ITrainingScheduleService service)
        {
            _service = service;
        }

        // GET: api/training-schedules
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var schedules = await _service.GetAllAsync();

            return Ok(schedules);
        }

        // GET: api/training-schedules/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var schedule = await _service.GetByIdAsync(id);

            if (schedule == null)
            {
                return NotFound(new
                {
                    message = "Training Schedule not found."
                });
            }

            return Ok(schedule);
        }

        // POST: api/training-schedules
        [HttpPost]
public async Task<IActionResult> Create(CreateTrainingScheduleDto dto)
{
    try
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var schedule = await _service.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = schedule.Id },
            schedule);
    }
    catch (Exception ex)
    {
        return Conflict(new
        {
            message = ex.Message
        });
    }
}

        // PUT: api/training-schedules/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateTrainingScheduleDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var schedule = await _service.UpdateAsync(id, dto);

            if (schedule == null)
            {
                return NotFound(new
                {
                    message = "Training Schedule not found."
                });
            }

            return Ok(schedule);
        }

        // DELETE: api/training-schedules/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            bool deleted = await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Training Schedule not found."
                });
            }

            return Ok(new
            {
                message = "Training Schedule deleted successfully."
            });
        }
    }
}