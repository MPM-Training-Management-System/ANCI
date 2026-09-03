using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Admin;
using server.Services.Interfaces;
using server.Enums;
namespace server.Services;

public class AdminProfileService
    : IAdminProfileService
{
    private readonly ApplicationDbContext _db;

    public AdminProfileService(
        ApplicationDbContext db)
    {
        _db = db;
    }

    // =========================================================
    // GET MY ADMIN PROFILE
    // GET /api/admin-profiles/me
    // =========================================================

   public async Task<AdminProfileDto?> GetMyProfileAsync(Guid userId)
    {
        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(x =>
                x.Id == userId &&
                x.Role == UserRole.Admin);

        if (user is null)
            return null;

        return new AdminProfileDto(
            user.Id,
            user.UserCode,
            user.FullName,
            user.Email,
            user.MobileNumber,
            user.Role.ToString(),
            user.Status.ToString()
        );
    }
}