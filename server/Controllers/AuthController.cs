using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
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

    public AuthController(
        JwtService jwtService,
        AppDbContext context)
    {
        _jwtService = jwtService;
        _context = context;
    }

    // ===========================
    // LOGIN
    // ===========================

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDTO request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new
            {
                message = "Email and Password are required."
            });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(x => x.Email == request.Email);

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        // TEMPORARY ONLY
        // Palitan ito ng BCrypt.Verify kapag may password hashing na.
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
{
    return Unauthorized(new
    {
        message = "Invalid email or password."
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
                user.Username,
                user.FullName,
                user.Email,
                user.Role
            }
        });
    }

    [HttpPost("register")]
public async Task<IActionResult> Register([FromBody] RegisterDTO request)
{
    if (string.IsNullOrWhiteSpace(request.Username) ||
        string.IsNullOrWhiteSpace(request.FullName) ||
        string.IsNullOrWhiteSpace(request.Email) ||
        string.IsNullOrWhiteSpace(request.Password))
    {
        return BadRequest(new
        {
            message = "All fields are required."
        });
    }

    // Check duplicate email
    bool emailExists = await _context.Users
        .AnyAsync(x => x.Email == request.Email);

    if (emailExists)
    {
        return BadRequest(new
        {
            message = "Email already exists."
        });
    }

    var user = new UserModel
    {
        Username = request.Username,
        FullName = request.FullName,
        Email = request.Email,
        Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
        Role = "User",
        Create_at = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
    };

    _context.Users.Add(user);
    await _context.SaveChangesAsync();

    return Ok(new
    {
        message = "User registered successfully."
    });
}
}