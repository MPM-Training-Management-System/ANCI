using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Services.Interfaces;
using System.Security.Claims;

namespace server.Controllers
{
    [ApiController]
    [Route("api/admin/participant-applications")]
    [Authorize(Roles = "Admin")]
    public class ParticipantApplicationController
        : ControllerBase
    {
        private readonly IParticipantApplicationService _service;

        public ParticipantApplicationController(
            IParticipantApplicationService service)
        {
            _service = service;
        }

        // ==========================================
        // GET PENDING APPLICATIONS
        // ==========================================

        [HttpGet("pending")]
        public async Task<IActionResult> GetPending()
        {
            var applications =
                await _service.GetPendingApplicationsAsync();

            return Ok(applications);
        }

        // ==========================================
        // GET APPLICATION DETAILS
        // ==========================================

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var application =
                    await _service.GetByIdAsync(id);

                if (application == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Participant application not found."
                    });
                }

                return Ok(application);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // ==========================================
        // APPROVE
        // ==========================================

        [HttpPatch("{id:guid}/approve")]
        public async Task<IActionResult> Approve(
            Guid id)
        {
            try
            {
                var adminIdClaim =
                    User.FindFirst(
                        ClaimTypes.NameIdentifier
                    )?.Value;

                if (!Guid.TryParse(
                    adminIdClaim,
                    out var adminId))
                {
                    return Unauthorized(new
                    {
                        message =
                            "Invalid admin identity."
                    });
                }

                await _service.ApproveAsync(
                    id,
                    adminId
                );

                return Ok(new
                {
                    message =
                        "Participant application approved."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // ==========================================
        // REJECT
        // ==========================================

        [HttpPatch("{id:guid}/reject")]
        public async Task<IActionResult> Reject(
            Guid id,
            [FromBody] RejectApplicationRequest request)
        {
            try
            {
                var adminIdClaim =
                    User.FindFirst(
                        ClaimTypes.NameIdentifier
                    )?.Value;

                if (!Guid.TryParse(
                    adminIdClaim,
                    out var adminId))
                {
                    return Unauthorized(new
                    {
                        message =
                            "Invalid admin identity."
                    });
                }

                await _service.RejectAsync(
                    id,
                    adminId,
                    request.Reason
                );

                return Ok(new
                {
                    message =
                        "Participant application rejected."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
    }

    // ==========================================
    // REJECT REQUEST
    // ==========================================

    public class RejectApplicationRequest
    {
        public string Reason { get; set; } = string.Empty;
    }
}