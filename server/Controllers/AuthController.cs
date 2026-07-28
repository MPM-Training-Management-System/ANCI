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
            user.Role
        }
    });
}

    // ===========================
    // REGISTER
    // ===========================

  [HttpPost("register")]
public async Task<IActionResult> Register(RegisterParticipantDTOs request)
{
    using var transaction = await _context.Database.BeginTransactionAsync();

    try
    {
        // Check email
        if (await _context.Users.AnyAsync(x => x.Email == request.Email))
        {
            return BadRequest(new
            {
                message = "Email already exists."
            });
        }

        if (await _context.Users.AnyAsync(x =>
    x.Username.ToLower() == request.Username.Trim().ToLower()))
{
    return BadRequest(new
    {
        message = "Username already exists."
    });
}

        // Create User
       var user = new UserModel
{
    UserId = await GenerateUserId("Participant"),
    Username = request.Username.Trim(),
    Email = request.Email.Trim(),
    Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
    Role = "Participant",
    Fullname = string.Join(" ",
        new[]
        {
            request.FirstName,
            request.MiddleName,
            request.LastName
        }
        .Where(x => !string.IsNullOrWhiteSpace(x)))
};

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        // Upload image (optional)
       string? imagePath = null;

if (request.ProfileImage != null)
{
    imagePath = await _cloudinary.UploadImageAsync(request.ProfileImage);
}

        // Create Participant
        var participant = new ParticipantModel
        {
            Id = Guid.NewGuid(),

            UserId = user.Id,

            

            ProfileImage = imagePath,

            FirstName = request.FirstName,

            MiddleName = request.MiddleName,

            LastName = request.LastName,

            DateOfBirth = request.DateOfBirth,

            Gender = request.Gender,

            CivilStatus = request.CivilStatus,

            MobileNumber = request.MobileNumber,

            Email = request.Email,

            Username = request.Username,

            HomeAddress = request.HomeAddress,

            EmergencyContactName = request.EmergencyContactName,

            EmergencyRelationship = request.EmergencyRelationship,

            EmergencyContactNumber = request.EmergencyContactNumber
        };

        _context.Participant.Add(participant);

        await _context.SaveChangesAsync();

        await transaction.CommitAsync();

        return Ok(new
        {
            message = "Participant registered successfully."
        });
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
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
        .Where(u => u.UserId.StartsWith($"{prefix}{year}-"))
        .OrderByDescending(u => u.UserId)
        .FirstOrDefaultAsync();

    int nextNumber = 1;

    if (lastUser != null)
    {
        var parts = lastUser.UserId.Split('-');

        if (parts.Length == 2 &&
            int.TryParse(parts[1], out int lastNumber))
        {
            nextNumber = lastNumber + 1;
        }
    }

    return $"{prefix}{year}-{nextNumber:D3}";
}

    // ===========================
    // CURRENT USER
    // ===========================

   [Authorize]
[HttpGet("me")]
public async Task<IActionResult> Me()
{
    var email = User.FindFirst(ClaimTypes.Email)?.Value;

    if (string.IsNullOrEmpty(email))
    {
        return Unauthorized(new { message = "Invalid token." });
    }

    var user = await _context.Users
        .FirstOrDefaultAsync(x => x.Email == email);

    if (user == null)
    {
        return NotFound(new { message = "User not found." });
    }

    var participant = await _context.Participant
        .FirstOrDefaultAsync(x => x.UserId == user.Id);

      

    return Ok(new
    {
        user.Id,

        FirstName = participant?.FirstName,
        MiddleName = participant?.MiddleName,
        LastName = participant?.LastName,
        

        FullName = participant == null
            ? null
            : string.Join(" ",
                new[]
                {
                    participant.FirstName,
                    participant.LastName
                }.Where(x => !string.IsNullOrWhiteSpace(x))),

        user.Email,
        user.Role,
        user.UserId,
        user.Username,
        ProfileImage = participant?.ProfileImage
    });
}

    // ===========================
    // CHANGE PASSWORD
    // ===========================

    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDTO request)
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrEmpty(email))
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

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.Password))
        {
            return BadRequest(new
            {
                message = "Current password is incorrect."
            });
        }

        user.Password = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Password changed successfully."
        });
    }
}