using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.DTOs.User;
using server.Services.Interfaces;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,Trainer" )]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    // =====================================
    // GET ALL USERS
    // GET: api/user
    // GET: api/user?search=juan&role=Participant
    // =====================================
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? role)
    {
    var currentRole = User.FindFirst(ClaimTypes.Role)?.Value;

    if (currentRole == "Trainer")
    {
        // Trainer can only see participants
        role = "Participant";
    }

    var users = await _userService.GetAllAsync(search, role);

    return Ok(users);
        
    }

    // =====================================
    // GET USER BY ID
    // =====================================
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var user = await _userService.GetByIdAsync(id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(user);
    }

    // =====================================
    // CREATE USER
    // =====================================
    [HttpPost]
    public async Task<IActionResult> Create(CreateUserDTO dto)
    {
        try
        {
            var user = await _userService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = user.Id },
                user);
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =====================================
    // UPDATE USER
    // =====================================
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        Guid id,
        UpdateUserDTO dto)
    {
        try
        {
            var user = await _userService.UpdateAsync(id, dto);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    // =====================================
    // DELETE USER
    // =====================================
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _userService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(new
        {
            message = "User deleted successfully."
        });
    }
}