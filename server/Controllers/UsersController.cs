using server.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ACE.NextGen.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public UsersController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _db.Users
            .AsNoTracking()
            .Select(x => new
            {
                x.Id,
                x.UserCode,
                x.FullName,
                x.Email,
                x.Role,
                x.Status,
                x.IsEmailVerified,
                x.CreatedAt,
                x.UpdatedAt
            })
            .ToListAsync();

        return Ok(users);
    }
}