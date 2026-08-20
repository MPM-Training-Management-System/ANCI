using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Auth;
using server.Enums;
using server.Models.Auth;
using server.Security;
using server.Services.Interfaces;

namespace server.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _db;

    private readonly PasswordService
        _passwordService;

    private readonly JwtService
        _jwtService;

    public AuthService(
        ApplicationDbContext db,
        PasswordService passwordService,
        JwtService jwtService)
    {
        _db = db;
        _passwordService = passwordService;
        _jwtService = jwtService;
    }


    public async Task<UserRegistrationResponse>
        RegisterParticipantAsync(
            RegisterRequest request)
    {
        var email = request.Email
            .Trim()
            .ToLowerInvariant();

        var existingUser =
            await _db.Users
                .FirstOrDefaultAsync(
                    x => x.Email == email
                );

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

            UserCode =
                await GenerateUserCodeAsync(),

            FullName =
                request.FullName.Trim(),

            Email = email,

            MobileNumber =
                string.IsNullOrWhiteSpace(
                    request.MobileNumber)
                    ? null
                    : request.MobileNumber.Trim(),

            PasswordHash =
                passwordHash,

            Role =
                UserRole.Participant,

            Status =
                UserStatus.Pending,

            IsEmailVerified =
                false,

            CreatedAt =
                DateTime.UtcNow,

            UpdatedAt =
                DateTime.UtcNow
        };

        _db.Users.Add(user);

        await _db.SaveChangesAsync();

        return new UserRegistrationResponse
        {
            Id = user.Id,

            UserCode =
                user.UserCode,

            FullName =
                user.FullName,

            Email =
                user.Email,

            Role =
                user.Role.ToString(),

            Status =
                user.Status.ToString(),

            Message =
                "Registration successful. Your account is pending verification."
        };
    }


    public async Task<LoginResponse>
        LoginAsync(
            LoginRequest request)
    {
        var email =
            request.Email
                .Trim()
                .ToLowerInvariant();

        var user =
            await _db.Users
                .FirstOrDefaultAsync(
                    x => x.Email == email
                );

        if (user is null)
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password."
            );
        }

        var passwordValid =
            _passwordService.VerifyPassword(
                request.Password,
                user.PasswordHash
            );

        if (!passwordValid)
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password."
            );
        }

   
        if (
            user.Status ==
                UserStatus.Inactive
            ||
            user.Status ==
                UserStatus.Suspended
            ||
            user.Status ==
                UserStatus.Rejected
        )
        {
            throw new UnauthorizedAccessException(
                "This account is not allowed to login."
            );
        }

        var jwt =
            _jwtService.GenerateToken(user);

        return new LoginResponse
        {
            Token =
                jwt.Token,

            ExpiresAt =
                jwt.ExpiresAt,

            User =
                new UserLoginDto
                {
                    Id =
                        user.Id,

                    UserCode =
                        user.UserCode,

                    FullName =
                        user.FullName,

                    Email =
                        user.Email,

                    Role =
                        user.Role.ToString(),

                    Status =
                        user.Status.ToString()
                }
        };
    }


    private async Task<string>
        GenerateUserCodeAsync()
    {
        var count =
            await _db.Users.CountAsync();

        return $"PAR-{count + 1:D6}";
    }
}