using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using server.DTOs.Admin;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "Admin")]
public class AdminUserController : ControllerBase
{
    private readonly IAdminUserService _adminUserService;

    public AdminUserController(
        IAdminUserService adminUserService
    )
    {
        _adminUserService =
            adminUserService;
    }


    // =========================================================
    // GET ALL USERS
    // GET /api/admin/users
    // =========================================================

    [HttpGet]
    public async Task<IActionResult>
        GetUsers()
    {
        var users =
            await _adminUserService
                .GetUsersAsync();

        return Ok(users);
    }


    // =========================================================
    // GET USER
    // GET /api/admin/users/{id}
    // =========================================================

    [HttpGet("{id:guid}")]
    public async Task<IActionResult>
        GetUser(
            Guid id
        )
    {
        var user =
            await _adminUserService
                .GetUserByIdAsync(id);

        if (user is null)
        {
            return NotFound(
                new
                {
                    message = "User not found."
                }
            );
        }

        return Ok(user);
    }


    // =========================================================
    // UPDATE USER
    // PUT /api/admin/users/{id}
    // =========================================================

    [HttpPut("{id:guid}")]
    public async Task<IActionResult>
        UpdateUser(
            Guid id,
            [FromBody] UpdateAdminUserRequest request
        )
    {
        try
        {
            var user =
                await _adminUserService
                    .UpdateUserAsync(
                        id,
                        request
                    );

            if (user is null)
            {
                return NotFound(
                    new
                    {
                        message = "User not found."
                    }
                );
            }

            return Ok(user);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(
                new
                {
                    message = ex.Message
                }
            );
        }
    }


    // =========================================================
    // UPDATE STATUS
    // PATCH /api/admin/users/{id}/status
    // =========================================================

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult>
        UpdateStatus(
            Guid id,
            [FromBody]
            UpdateAdminUserStatusRequest request
        )
    {
        var user =
            await _adminUserService
                .UpdateUserStatusAsync(
                    id,
                    request
                );

        if (user is null)
        {
            return NotFound(
                new
                {
                    message = "User not found."
                }
            );
        }

        return Ok(user);
    }


    // =========================================================
    // DELETE USER
    // DELETE /api/admin/users/{id}
    // =========================================================

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult>
        DeleteUser(
            Guid id
        )
    {
        try
        {
            var deleted =
                await _adminUserService
                    .DeleteUserAsync(id);

            if (!deleted)
            {
                return NotFound(
                    new
                    {
                        message = "User not found."
                    }
                );
            }

            return Ok(
                new
                {
                    message = "User deleted successfully."
                }
            );
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(
                new
                {
                    message = ex.Message
                }
            );
        }
    }
}