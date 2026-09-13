using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.DTOs.Service;
using server.Services.Service;
using System.Security.Claims;

namespace server.Controllers;

[ApiController]
[Route("api/services")]
public class ServicesController : ControllerBase
{
    private readonly IService _service;

    public ServicesController(IService service)
    {
        _service = service;
    }

    // GET: api/services
    [HttpGet]
    public async Task<ActionResult<List<ServiceDto>>> GetAll()
    {
        var services = await _service.GetAllAsync();

        return Ok(services);
    }

    // GET: api/services/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ServiceDto>> GetById(Guid id)
    {
        var service = await _service.GetByIdAsync(id);

        if (service == null)
        {
            return NotFound(new
            {
                message = "Service not found."
            });
        }

        return Ok(service);
    }

    // POST: api/services
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<ServiceDto>> Create(
        [FromBody] CreateServiceDto dto)
    {
        try
        {
            var service = await _service.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = service.Id },
                service
            );
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    // PUT: api/services/{id}
    [Authorize(Roles = "Admin")]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ServiceDto>> Update(
        Guid id,
        [FromBody] UpdateServiceDto dto)
    {
        try
        {
            var service = await _service.UpdateAsync(id, dto);

            if (service == null)
            {
                return NotFound(new
                {
                    message = "Service not found."
                });
            }

            return Ok(service);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    // DELETE: api/services/{id}
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            var deleted = await _service.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = "Service not found."
                });
            }

            return Ok(new
            {
                message = "Service deleted successfully."
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

    // POST: api/services/requests
    [Authorize]
    [HttpPost("requests")]
    public async Task<ActionResult<ServiceRequestDto>> CreateRequest(
        [FromBody] CreateServiceRequestDto dto)
    {
        try
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid user identity."
                });
            }

            var request = await _service.CreateRequestAsync(
                userId,
                dto
            );

            return Ok(request);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet("requests")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> GetRequests()
{
    var requests = await _service.GetRequestsAsync();

    return Ok(requests);
}

[HttpGet("requests/{id:guid}")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> GetRequest(
    Guid id
)
{
    var request = await _service.GetRequestByIdAsync(id);

    if (request == null)
    {
        return NotFound(new
        {
            message = "Service request not found."
        });
    }

    return Ok(request);
}

[HttpPut("requests/{id:guid}/status")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> UpdateRequestStatus(
    Guid id,
    [FromBody] UpdateServiceRequestStatusDto dto
)
{
    if (string.IsNullOrWhiteSpace(dto.Status))
    {
        return BadRequest(new
        {
            message = "Status is required."
        });
    }

    var adminUserIdClaim = User.FindFirst(
        ClaimTypes.NameIdentifier
    )?.Value;

    if (!Guid.TryParse(
        adminUserIdClaim,
        out var adminUserId
    ))
    {
        return Unauthorized(new
        {
            message = "Invalid admin user."
        });
    }

    try
    {
        var request =
            await _service.UpdateRequestStatusAsync(
                id,
                adminUserId,
                dto
            );

        if (request == null)
        {
            return NotFound(new
            {
                message = "Service request not found."
            });
        }

        return Ok(request);
    }
    catch (ArgumentException ex)
    {
        return BadRequest(new
        {
            message = ex.Message
        });
    }
}
}