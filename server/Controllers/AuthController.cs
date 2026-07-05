using Microsoft.AspNetCore.Mvc;
using server.DTOs;
using server.Models;
using server.Services;
namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly JwtService _jwtService;

    public AuthController(JwtService jwtService)
    {
        _jwtService = jwtService;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] UserDTO request)
    {
        Console.WriteLine("🔥 CONTROLLER HIT");
        Console.WriteLine($"Username: {request.Email}");
        Console.WriteLine($"Password: {request.Password}");

        string mockUsername = "admin@gmail.com";
        string mockPassword = "12345";
        
        Console.WriteLine("🔍 Checking credentials...");

        if (
            request.Email != mockUsername ||
            request.Password != mockPassword
        )
        {
            Console.WriteLine(" LOGIN FAILED");

            return Unauthorized(new
            {
                message = "Invalid username or password"
            });
        }

        Console.WriteLine("LOGIN SUCCESS");

        var user = new UserModel
        {
            Id = 1,
            Username = "admin",
            FullName = "System Admin",
            Role = "Admin"
        };
          var token = _jwtService.GenerateToken(user);  
        return Ok(new
        {
            message = "Login Successful",
            user,
            token
        });
    }
}