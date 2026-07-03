using Microsoft.AspNetCore.Mvc;
using server.DTOs;
using server.Models;

namespace server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] UserDTO request)
    {
        Console.WriteLine("🔥 CONTROLLER HIT");
        Console.WriteLine($"Username: {request.Username}");
        Console.WriteLine($"Password: {request.Password}");

        string mockUsername = "admin@gmail.com";
        string mockPassword = "12345";

        Console.WriteLine("🔍 Checking credentials...");

        if (
            request.Username != mockUsername ||
            request.Password != mockPassword
        )
        {
            Console.WriteLine("❌ LOGIN FAILED");

            return Unauthorized(new
            {
                message = "Invalid username or password"
            });
        }

        Console.WriteLine("✅ LOGIN SUCCESS");

        var user = new UserModel
        {
            Id = 1,
            Username = "admin",
            FullName = "System Admin",
            Role = "Admin"
        };

        return Ok(new
        {
            message = "Login Successful",
            user
        });
    }
}