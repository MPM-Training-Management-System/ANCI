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

        private readonly ICacheService
            _cacheService;

        public UserApplicationController(
            IUserApplicationService service,
            ICacheService cacheService)
        {
            _service = service;
            _cacheService = cacheService;
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
                // =================================================
                // GET ADMIN ID
                // =================================================

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

                // =================================================
                // CHECK APPLICATION FIRST
                // =================================================

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

                // =================================================
                // APPROVE
                // =================================================

                await _service.ApproveAsync(
                    id,
                    adminId
                );

                // =================================================
                // CLEAR APPLICATION CACHE
                // =================================================

                _cacheService.Remove(
                    $"application:{id}"
                );

                _cacheService.Remove(
                    $"user-application:{id}"
                );

                // =================================================
                // CLEAR PENDING APPLICATION CACHE
                // =================================================

                _cacheService.Remove(
                    "pending-applications"
                );

                _cacheService.Remove(
                    "user-applications:pending"
                );

                // =================================================
                // LOG
                // =================================================

                Console.WriteLine(
                    "================================"
                );

                Console.WriteLine(
                    "APPLICATION APPROVED"
                );

                Console.WriteLine(
                    $"APPLICATION ID: {id}"
                );

                Console.WriteLine(
                    "APPLICATION CACHE CLEARED"
                );

                Console.WriteLine(
                    "================================"
                );

                return Ok(new
                {
                    message =
                        "Application approved successfully."
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    "APPLICATION APPROVAL ERROR:"
                );

                Console.WriteLine(
                    ex.Message
                );

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
                // =================================================
                // GET ADMIN ID
                // =================================================

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

                // =================================================
                // VALIDATE REASON
                // =================================================

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

                // =================================================
                // CHECK APPLICATION
                // =================================================

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

                // =================================================
                // REJECT
                // =================================================

                await _service.RejectAsync(
                    id,
                    adminId,
                    request.Reason
                );

                // =================================================
                // CLEAR APPLICATION CACHE
                // =================================================

                _cacheService.Remove(
                    $"application:{id}"
                );

                _cacheService.Remove(
                    $"user-application:{id}"
                );

                // =================================================
                // CLEAR PENDING APPLICATION CACHE
                // =================================================

                _cacheService.Remove(
                    "pending-applications"
                );

                _cacheService.Remove(
                    "user-applications:pending"
                );

                // =================================================
                // LOG
                // =================================================

                Console.WriteLine(
                    "================================"
                );

                Console.WriteLine(
                    "APPLICATION REJECTED"
                );

                Console.WriteLine(
                    $"APPLICATION ID: {id}"
                );

                Console.WriteLine(
                    "APPLICATION CACHE CLEARED"
                );

                Console.WriteLine(
                    "================================"
                );

                return Ok(new
                {
                    message =
                        "Application rejected successfully."
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    "APPLICATION REJECTION ERROR:"
                );

                Console.WriteLine(
                    ex.Message
                );

                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
    }
}