using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.DTOs.User;
using server.Services.Interfaces;
using System.Security.Claims;

namespace server.Controllers
{
    [ApiController]
    [Route("api/admin/applications")]
    [Authorize(Roles = "Admin")]
    public class UserApplicationController
        : ControllerBase
    {
        private readonly IUserApplicationService
            _service;

        public UserApplicationController(
            IUserApplicationService service)
        {
            _service = service;
        }

        // =====================================================
        // GET PENDING APPLICATIONS
        //
        // BOTH:
        // Participant
        // Trainer
        // =====================================================

        [HttpGet("pending")]
        public async Task<IActionResult>
            GetPending()
        {
            try
            {
                var applications =
                    await _service
                        .GetPendingApplicationsAsync();

                return Ok(applications);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // =====================================================
        // GET APPLICATION DETAILS
        //
        // Participant OR Trainer
        // =====================================================

        [HttpGet("{id:guid}")]
        public async Task<IActionResult>
            GetById(Guid id)
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
                            "Application not found."
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

        // =====================================================
        // APPROVE
        //
        // PATCH:
        // /api/admin/applications/{id}/approve
        // =====================================================

        [HttpPatch("{id:guid}/approve")]
        public async Task<IActionResult>
            Approve(Guid id)
        {
            try
            {
                var adminIdClaim =
                    User.FindFirst(
                        ClaimTypes.NameIdentifier
                    )?.Value;

                if (
                    !Guid.TryParse(
                        adminIdClaim,
                        out var adminId
                    )
                )
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
                        "Application approved successfully."
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

        // =====================================================
        // REJECT
        //
        // PATCH:
        // /api/admin/applications/{id}/reject
        // =====================================================

        [HttpPatch("{id:guid}/reject")]
        public async Task<IActionResult>
            Reject(
                Guid id,
                [FromBody]
                RejectApplicationRequest request)
        {
            try
            {
                var adminIdClaim =
                    User.FindFirst(
                        ClaimTypes.NameIdentifier
                    )?.Value;

                if (
                    !Guid.TryParse(
                        adminIdClaim,
                        out var adminId
                    )
                )
                {
                    return Unauthorized(new
                    {
                        message =
                            "Invalid admin identity."
                    });
                }

                if (
                    string.IsNullOrWhiteSpace(
                        request.Reason
                    )
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Rejection reason is required."
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
                        "Application rejected successfully."
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
}