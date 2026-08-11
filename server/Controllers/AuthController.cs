using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs;
using server.DTOs.Otp;
using server.DTOs.Participant;
using server.Models;
using server.Services;
using server.Services.Interfaces;
using System.Security.Claims;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly JwtService _jwtService;
    private readonly AppDbContext _context;
    
    private readonly ICacheService _cacheService;
    private readonly IOtpService _otpService;
    private readonly IEmailService _emailService;
    private readonly CloudinaryService _cloudinary;
    
    public AuthController(
    JwtService jwtService,
    AppDbContext context,
    IOtpService otpService,
    IEmailService emailService,
    CloudinaryService cloudinary,
     ICacheService cacheService)
{
    _jwtService = jwtService;
    _context = context;
    _cloudinary = cloudinary;
    _otpService = otpService;
    _emailService = emailService;
     _cacheService = cacheService;
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

var cacheKey = $"user:login:{login}";

var user = _cacheService.Get<UserModel>(cacheKey);

if (user == null)
{
    Console.WriteLine("CACHE MISS - DATABASE");

    user = await _context.Users
        .FirstOrDefaultAsync(x =>
            x.Email.ToLower() == login ||
            x.Username.ToLower() == login);

    if (user != null)
    {
        Console.WriteLine(
            $"DATABASE USER: {user.Email} | IsActive: {user.IsActive}"
        );

        _cacheService.Set(
            cacheKey,
            user,
            TimeSpan.FromMinutes(5)
        );
    }
}
else
{
    Console.WriteLine(
        $"CACHE HIT: {user.Email} | IsActive: {user.IsActive}"
    );
}

if (user == null)
{
    return Unauthorized(new
    {
        message =
            "Invalid username/email or password."
    });
}

if (!BCrypt.Net.BCrypt.Verify(
    request.Password,
    user.Password))
{
    return Unauthorized(new
    {
        message =
            "Invalid username/email or password."
    });
}
    


     if (!user.IsActive)
    {
        return Unauthorized(new
        {
            message =
                "Your account is currently inactive. Please wait for admin approval."
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
            user.Fullname,
            user.IsActive,
            user.IsEmailVerified
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
    var year = DateTime.UtcNow.ToString("yy");

    var prefix = role switch
    {
        "Admin" => "A",
        "Trainer" => "T",
        "Participant" => "P",
        _ => "U"
    };

    var lastUser = await _context.Users
        .Where(x =>
            x.Role == role &&
            x.UserId.StartsWith($"{prefix}{year}-"))
        .OrderByDescending(x => x.UserId)
        .FirstOrDefaultAsync();

    int next = 1;

    if (lastUser != null)
    {
        var split = lastUser.UserId.Split('-');

        if (
            split.Length == 2 &&
            int.TryParse(split[1], out int number)
        )
        {
            next = number + 1;
        }
    }

    // Trainer = 4 digits
    // Participant = 3 digits
    var digitCount = role switch
    {
        "Trainer" => 4,
        "Participant" => 3,
        "Admin" => 3,
        _ => 3
    };

    return $"{prefix}{year}-{next.ToString($"D{digitCount}")}";
}
[HttpPost("register-account")]
public async Task<IActionResult> RegisterAccount(
    [FromBody] RegisterAccountRequest request)
{
    // ===========================
    // VALIDATION
    // ===========================

    if (string.IsNullOrWhiteSpace(request.Username))
    {
        return BadRequest(new
        {
            message = "Username is required."
        });
    }

    if (string.IsNullOrWhiteSpace(request.Email))
    {
        return BadRequest(new
        {
            message = "Email is required."
        });
    }

    if (string.IsNullOrWhiteSpace(request.Password))
    {
        return BadRequest(new
        {
            message = "Password is required."
        });
    }

    var username = request.Username.Trim();
    var email = request.Email.Trim().ToLower();
    var role = request.Role.Trim();


      if (role != "Participant" && role != "Trainer")
    {
        return BadRequest(new
        {
            message = "Invalid registration role."
        });
    }


    // ===========================
    // CHECK USERNAME
    // ===========================

    var existingUsername = await _context.Users
        .FirstOrDefaultAsync(x =>
            x.Username.ToLower() == username.ToLower());

    if (existingUsername != null)
    {
        return Conflict(new
        {
            message = "Username is already taken."
        });
    }

    // ===========================
    // CHECK EMAIL
    // ===========================

    var existingEmail = await _context.Users
        .FirstOrDefaultAsync(x =>
            x.Email.ToLower() == email);

    if (existingEmail != null)
    {
        return Conflict(new
        {
            message = "Email is already registered."
        });
    }

    // ===========================
    // CREATE USER
    // ===========================

    var user = new UserModel
    {
        Id = Guid.NewGuid(),

        UserId = await GenerateUserId(role),

        Username = username,

        Email = email,

        Password = BCrypt.Net.BCrypt.HashPassword(
            request.Password
        ),

        Role = role,

        IsActive = true,

        IsEmailVerified = false,

        CreatedAt = DateTime.UtcNow
    };

    _context.Users.Add(user);

    await _context.SaveChangesAsync();

   

    return Ok(new
    {
        message = "Account created successfully",
        userId = user.Id,
        email = user.Email,
        role = user.Role
    });
}

[HttpPost("send-otp")]
public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
{
    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.Email == request.Email);

    if (user == null)
    {
        return NotFound(new
        {
            message = "User not found."
        });
    }

    var otp = await _otpService.GenerateOtpAsync(
        user.Id,
        "EmailVerification"
    );

    await _emailService.SendOtpEmailAsync(
        user.Email,
        otp
    );

    return Ok(new
    {
        message = "OTP sent successfully."
    });
}
[HttpPost("verify-otp")]
public async Task<IActionResult> VerifyOtp(
    [FromBody] VerifyOtpRequest request)
{
    var email = request.Email.Trim().ToLower();

    var user = await _context.Users
        .FirstOrDefaultAsync(u =>
            u.Email.ToLower() == email);

    if (user == null)
    {
        return NotFound(new
        {
            message = "User not found."
        });
    }

    // Check if already verified
    if (user.IsEmailVerified)
    {
        return BadRequest(new
        {
            message = "Email is already verified."
        });
    }

    // Verify OTP
    var isValid = await _otpService.VerifyOtpAsync(
        user.Id,
        request.Otp,
        "EmailVerification"
    );

    if (!isValid)
    {
        return BadRequest(new
        {
            message = "Invalid or expired OTP."
        });
    }

    // Mark email as verified
    user.IsEmailVerified = true;

    await _context.SaveChangesAsync();

    return Ok(new
    {
        message = "Email verified successfully.",
        userId = user.Id,
        email = user.Email
    });
}
}