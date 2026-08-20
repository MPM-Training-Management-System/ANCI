using server.Data;
using server.DTOs.Auth;
using server.Enums;
using server.Models.Auth;
using server.Security;
using server.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace server.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _db;
    private readonly PasswordService _passwordService;

    public AuthService(
        ApplicationDbContext db,
        PasswordService passwordService)
    {
        _db = db;
        _passwordService = passwordService;
    }

    public async Task<UserRegistrationResponse>
        RegisterParticipantAsync(
            RegisterRequest request)
    {
        var email = request.Email
            .Trim()
            .ToLowerInvariant();

        var existingUser = await _db.Users
            .FirstOrDefaultAsync(x => x.Email == email);

        if (existingUser is not null)
        {
            throw new InvalidOperationException(
                "An account with this email already exists."
            );
        }

        var passwordHash =
            _passwordService.HashPassword(
                request.Password
            );

        var user = new User
        {
            Id = Guid.NewGuid(),

            UserCode = await GenerateUserCodeAsync(),

            FullName = request.FullName.Trim(),

            Email = email,

            MobileNumber =
                string.IsNullOrWhiteSpace(
                    request.MobileNumber)
                    ? null
                    : request.MobileNumber.Trim(),

            PasswordHash = passwordHash,

            Role = UserRole.Participant,

            Status = UserStatus.Pending,

            IsEmailVerified = false,

            CreatedAt = DateTime.UtcNow,

            UpdatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);

        await _db.SaveChangesAsync();

        return new UserRegistrationResponse
        {
            Id = user.Id,

            UserCode = user.UserCode,

            FullName = user.FullName,

            Email = user.Email,

            Role = user.Role.ToString(),

            Status = user.Status.ToString(),

            Message =
                "Registration successful. Your account is pending verification."
        };
    }

    private async Task<string> GenerateUserCodeAsync()
    {
        var prefix = "PAR";

        var count = await _db.Users.CountAsync();

        return $"{prefix}-{count + 1:D6}";
    }
}