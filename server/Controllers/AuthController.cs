using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.DTOs.Participant;
using server.Models;
using server.Services;
using System.Security.Claims;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly JwtService _jwtService;
    private readonly AppDbContext _context;

    private readonly CloudinaryService _cloudinary;
    
    public AuthController(
    JwtService jwtService,
    AppDbContext context,
    CloudinaryService cloudinary)
{
    _jwtService = jwtService;
    _context = context;
    _cloudinary = cloudinary;
}

    // ===========================
    // LOGIN
    // ===========================

 [HttpPost("login")]
public async Task<IActionResult> Login(LoginDTO request)
{
    if (string.IsNullOrWhiteSpace(request.Login) ||
        string.IsNullOrWhiteSpace(request.Password))
    {
        return BadRequest(new
        {
            message = "Username/Email and Password are required."
        });
    }

    var login = request.Login.Trim().ToLower();

    var user = await _context.Users
        .FirstOrDefaultAsync(x =>
            x.Email.ToLower() == login ||
            x.Username.ToLower() == login);

    if (user == null)
    {
        return Unauthorized(new
        {
            message = "Invalid username/email or password."
        });
    }

    if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
    {
        return Unauthorized(new
        {
            message = "Invalid username/email or password."
        });
    }

    var token = _jwtService.GenerateToken(user);

    return Ok(new
    {
        message = "Login successful.",
        token,
        user = new
        {
            user.Id,
            user.UserId,
            user.Username,
            user.Email,
            user.Role,
            user.Fullname
        }
    });
}
   
private static string BuildFullname(
    string first,
    string? middle,
    string last)
{
    return string.Join(" ",
        new[]
        {
            first,
            middle,
            last
        }
        .Where(x => !string.IsNullOrWhiteSpace(x)));
}

  [Authorize]
[HttpGet("me")]
public async Task<IActionResult> Me()
{
    var email = User.FindFirst(ClaimTypes.Email)?.Value;

    if (string.IsNullOrWhiteSpace(email))
    {
        return Unauthorized(new
        {
            message = "Invalid token."
        });
    }

    var user = await _context.Users
        .Include(x => x.Participant)
        .Include(x => x.Trainer)
        .FirstOrDefaultAsync(x => x.Email == email);

    if (user == null)
    {
        return NotFound(new
        {
            message = "User not found."
        });
    }

    return Ok(new
    {
        user.Id,

        user.UserId,

        user.Username,

        user.Email,

        user.Role,

        user.Fullname,
        

        ProfileImage =
            user.Participant?.ProfileImage ??
            user.Trainer?.ProfileImage
    });
}
[Authorize]
[HttpPut("change-password")]
public async Task<IActionResult> ChangePassword(
    ChangePasswordDTO request)
{
    var email = User.FindFirst(ClaimTypes.Email)?.Value;

    if (string.IsNullOrWhiteSpace(email))
    {
        return Unauthorized();
    }

    var user = await _context.Users
        .FirstOrDefaultAsync(x => x.Email == email);

    if (user == null)
    {
        return NotFound(new
        {
            message = "User not found."
        });
    }

    if (!BCrypt.Net.BCrypt.Verify(
        request.CurrentPassword,
        user.Password))
    {
        return BadRequest(new
        {
            message = "Current password is incorrect."
        });
    }

    user.Password =
        BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

    await _context.SaveChangesAsync();

    return Ok(new
    {
        message = "Password changed successfully."
    });
}
private async Task<string> GenerateUserId(string role)
{
    var year = DateTime.Now.ToString("yy");

    var prefix = role switch
    {
        "Admin" => "A",
        "Trainer" => "T",
        "Participant" => "P",
        _ => "U"
    };

    var lastUser = await _context.Users
        .Where(x =>
            x.UserId.StartsWith($"{prefix}{year}-"))
        .OrderByDescending(x => x.UserId)
        .FirstOrDefaultAsync();

    int next = 1;

    if (lastUser != null)
    {
        var split = lastUser.UserId.Split('-');

        if (split.Length == 2 &&
            int.TryParse(split[1], out int number))
        {
            next = number + 1;
        }
    }

    return $"{prefix}{year}-{next:D3}";
}
}