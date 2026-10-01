using Google.Apis.Auth;

using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Auth;
using server.Security;
using server.Services.Interfaces;

namespace server.Services;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly IConfiguration _configuration;

    private readonly ApplicationDbContext _db;

    private readonly JwtService _jwtService;

    public GoogleAuthService(
        IConfiguration configuration,
        ApplicationDbContext db,
        JwtService jwtService)
    {
        _configuration = configuration;

        _db = db;

        _jwtService = jwtService;
    }

    // =========================================================
    // GOOGLE LOGIN
    // POST /api/auth/google
    // =========================================================

    public async Task<GoogleLoginResponse> AuthenticateAsync(
        string idToken,
        CancellationToken cancellationToken = default)
    {
        var google =
            await ValidateGoogleTokenInternalAsync(
                idToken,
                cancellationToken
            );

        // -----------------------------------------------------
        // CHECK GOOGLE SUBJECT ID FIRST
        // -----------------------------------------------------

        var user =
            await _db.Users
                .FirstOrDefaultAsync(
                    x =>
                        x.GoogleSubjectId ==
                        google.GoogleSubjectId,
                    cancellationToken
                );

        // -----------------------------------------------------
        // IF NO GOOGLE SUBJECT MATCH
        // CHECK VERIFIED EMAIL
        // -----------------------------------------------------

        if (user is null)
        {
            user =
                await _db.Users
                    .FirstOrDefaultAsync(
                        x =>
                            x.Email ==
                            google.Email,
                        cancellationToken
                    );

            // -------------------------------------------------
            // EXISTING ACE ACCOUNT WITH SAME EMAIL
            // LINK GOOGLE ACCOUNT
            // -------------------------------------------------

            if (user is not null)
            {
                user.GoogleSubjectId =
                    google.GoogleSubjectId;

                user.IsEmailVerified = true;

                user.UpdatedAt =
                    DateTime.UtcNow;

                await _db.SaveChangesAsync(
                    cancellationToken
                );
            }
        }

        // -----------------------------------------------------
        // EXISTING USER
        // -----------------------------------------------------

        if (user is not null)
        {
            var jwt =
                _jwtService.GenerateToken(user);

            return new GoogleLoginResponse
            {
                IsNewUser = false,

                RequiresRegistration = false,

                GoogleSubjectId =
                    google.GoogleSubjectId,

                Email =
                    google.Email,

                FirstName =
                    google.FirstName,

                LastName =
                    google.LastName,

                FullName =
                    google.FullName,

                ProfileImageUrl =
                    google.ProfileImageUrl,

                Login = new LoginResponse
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
                }
            };
        }

        // -----------------------------------------------------
        // NEW USER
        // -----------------------------------------------------

        return new GoogleLoginResponse
        {
            IsNewUser = true,

            RequiresRegistration = true,

            GoogleSubjectId =
                google.GoogleSubjectId,

            Email =
                google.Email,

            FirstName =
                google.FirstName,

            LastName =
                google.LastName,

            FullName =
                google.FullName,

            ProfileImageUrl =
                google.ProfileImageUrl,

            Login = null
        };
    }


    // =========================================================
    // VALIDATE GOOGLE TOKEN
    // USED DURING GOOGLE REGISTRATION
    // =========================================================

    public async Task<GoogleLoginResponse> ValidateTokenAsync(
        string idToken,
        CancellationToken cancellationToken = default)
    {
        return await ValidateGoogleTokenInternalAsync(
            idToken,
            cancellationToken
        );
    }


    // =========================================================
    // GOOGLE TOKEN VALIDATION
    // =========================================================

    private async Task<GoogleLoginResponse>
        ValidateGoogleTokenInternalAsync(
            string idToken,
            CancellationToken cancellationToken)
    {
        // -----------------------------------------------------
        // VALIDATE TOKEN INPUT
        // -----------------------------------------------------

        if (string.IsNullOrWhiteSpace(idToken))
        {
            throw new InvalidOperationException(
                "Google ID token is required."
            );
        }


        // -----------------------------------------------------
        // GET GOOGLE CLIENT ID
        // -----------------------------------------------------

        var clientId =
            _configuration["Google:ClientId"];

        if (string.IsNullOrWhiteSpace(clientId))
        {
            throw new InvalidOperationException(
                "Google Client ID is not configured."
            );
        }


        // -----------------------------------------------------
        // VALIDATE GOOGLE ID TOKEN
        // -----------------------------------------------------

        GoogleJsonWebSignature.Payload payload;

        try
        {
            payload =
                await GoogleJsonWebSignature
                    .ValidateAsync(
                        idToken,
                        new GoogleJsonWebSignature
                            .ValidationSettings
                        {
                            Audience =
                                new[]
                                {
                                    clientId
                                }
                        }
                    );
        }
        catch
        {
            throw new UnauthorizedAccessException(
                "Invalid Google ID token."
            );
        }


        // -----------------------------------------------------
        // GOOGLE SUBJECT ID
        // -----------------------------------------------------

        if (string.IsNullOrWhiteSpace(
            payload.Subject))
        {
            throw new UnauthorizedAccessException(
                "Google account ID is missing."
            );
        }


        // -----------------------------------------------------
        // GOOGLE EMAIL
        // -----------------------------------------------------

        if (string.IsNullOrWhiteSpace(
            payload.Email))
        {
            throw new UnauthorizedAccessException(
                "Google account email is missing."
            );
        }


        // -----------------------------------------------------
        // GOOGLE EMAIL VERIFICATION
        // -----------------------------------------------------

        if (!payload.EmailVerified)
        {
            throw new UnauthorizedAccessException(
                "The Google email address has not been verified."
            );
        }


        // -----------------------------------------------------
        // NORMALIZE EMAIL
        // -----------------------------------------------------

        var email =
            payload.Email
                .Trim()
                .ToLowerInvariant();


        // -----------------------------------------------------
        // GOOGLE PROFILE INFORMATION
        // -----------------------------------------------------

        var profileImageUrl =
            string.IsNullOrWhiteSpace(
                payload.Picture
            )
                ? null
                : payload.Picture.Trim();


        // -----------------------------------------------------
        // DEBUG INFORMATION
        // -----------------------------------------------------

        Console.WriteLine(
            "================================================="
        );

        Console.WriteLine(
            "GOOGLE AUTHENTICATION"
        );

        Console.WriteLine(
            $"GOOGLE SUBJECT: {payload.Subject}"
        );

        Console.WriteLine(
            $"GOOGLE EMAIL: {email}"
        );

        Console.WriteLine(
            $"GOOGLE FIRST NAME: {payload.GivenName}"
        );

        Console.WriteLine(
            $"GOOGLE LAST NAME: {payload.FamilyName}"
        );

        Console.WriteLine(
            $"GOOGLE FULL NAME: {payload.Name}"
        );

        Console.WriteLine(
            $"GOOGLE PROFILE IMAGE: {profileImageUrl}"
        );

        Console.WriteLine(
            "================================================="
        );


        // -----------------------------------------------------
        // RETURN VERIFIED GOOGLE INFORMATION
        // -----------------------------------------------------

        return new GoogleLoginResponse
        {
            IsNewUser = true,

            RequiresRegistration = true,

            GoogleSubjectId =
                payload.Subject,

            Email =
                email,

            FirstName =
                payload.GivenName,

            LastName =
                payload.FamilyName,

            FullName =
                payload.Name,

            ProfileImageUrl =
                profileImageUrl,

            Login = null
        };
    }
}