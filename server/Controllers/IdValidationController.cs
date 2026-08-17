using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.DTOs;
using server.Services.Interfaces;
using System.Security.Claims;

namespace server.Controllers
{
    [ApiController]
    [Route("api/id-validation")]
    [Authorize]
    public class IdValidationController
        : ControllerBase
    {
        private readonly IIdValidationService
            _idValidationService;

        public IdValidationController(
            IIdValidationService idValidationService)
        {
            _idValidationService =
                idValidationService;
        }

        // =====================================================
        // VALIDATE ID
        // =====================================================

        [HttpPost("validate")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Validate(
            [FromForm] ValidateIdDTO dto)
        {
            try
            {
                // =================================================
                // GET USER ID FROM JWT
                // =================================================

                var userIdClaim =
                    User.FindFirst(
                        ClaimTypes.NameIdentifier
                    )?.Value;

                if (string.IsNullOrWhiteSpace(
                    userIdClaim))
                {
                    return Unauthorized(new
                    {
                        message =
                            "User ID was not found in authentication token."
                    });
                }

                if (!Guid.TryParse(
                    userIdClaim,
                    out var userId))
                {
                    return Unauthorized(new
                    {
                        message =
                            "Invalid user ID in authentication token."
                    });
                }

                // =================================================
                // VALIDATE FILE
                // =================================================

                if (dto.File == null ||
                    dto.File.Length == 0)
                {
                    return BadRequest(new
                    {
                        message =
                            "Valid ID file is required."
                    });
                }

                // =================================================
                // VALIDATE ID TYPE
                // =================================================

                if (string.IsNullOrWhiteSpace(
                    dto.IdType))
                {
                    return BadRequest(new
                    {
                        message =
                            "ID type is required."
                    });
                }

                Console.WriteLine(
                    "================================"
                );

                Console.WriteLine(
                    "VALID ID VALIDATION"
                );

                Console.WriteLine(
                    $"USER ID: {userId}"
                );

                Console.WriteLine(
                    $"FILE: {dto.File.FileName}"
                );

                Console.WriteLine(
                    $"ID TYPE: {dto.IdType}"
                );

                Console.WriteLine(
                    "================================"
                );

                // =================================================
                // VALIDATE ID
                // =================================================

                var result =
                    await _idValidationService.ValidateAsync(
                        userId,
                        dto.File,
                        dto.IdType
                    );

                // =================================================
                // LOG RESULT
                // =================================================

                Console.WriteLine(
                    "================================"
                );

                Console.WriteLine(
                    "ID VALIDATION RESULT"
                );

                Console.WriteLine(
                    $"STATUS: {result.Status}"
                );

                Console.WriteLine(
                    $"IS VALID: {result.IsValid}"
                );

                Console.WriteLine(
                    $"NAME MATCHED: {result.NameMatched}"
                );

                Console.WriteLine(
                    $"DOB MATCHED: {result.DateOfBirthMatched}"
                );

                Console.WriteLine(
                    $"ID TYPE MATCHED: {result.IdTypeMatched}"
                );

                Console.WriteLine(
                    $"EXTRACTED NAME: {result.ExtractedName}"
                );

                Console.WriteLine(
                    $"EXTRACTED DOB: {result.ExtractedDateOfBirth}"
                );

                Console.WriteLine(
                    $"NEEDS ADMIN REVIEW: {result.NeedsAdminReview}"
                );

                Console.WriteLine(
                    "================================"
                );

                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    "================================"
                );

                Console.WriteLine(
                    "ID VALIDATION ERROR"
                );

                Console.WriteLine(
                    ex.Message
                );

                Console.WriteLine(
                    "================================"
                );

                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
    }
}