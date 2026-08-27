using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Auth;
using server.Enums;
using server.Models.Auth;
using server.Models.Participant;
using server.Models.Trainer;
using server.Security;
using server.Services.Interfaces;

namespace server.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _db;
    private readonly PasswordService _passwordService;
    private readonly JwtService _jwtService;
    private readonly ICloudinaryService _cloudinaryService;

    public AuthService(
        ApplicationDbContext db,
        PasswordService passwordService,
        JwtService jwtService,
        ICloudinaryService cloudinaryService)
    {
        _db = db;
        _passwordService = passwordService;
        _jwtService = jwtService;
        _cloudinaryService = cloudinaryService;
    }

    // =========================================================
    // PARTICIPANT REGISTRATION
    // POST /api/auth/register
    // multipart/form-data
    // =========================================================

    public async Task<UserRegistrationResponse>
        RegisterParticipantAsync(
            RegisterParticipantRequest request)
    {
        // -----------------------------------------------------
        // NORMALIZE EMAIL
        // -----------------------------------------------------

        var email = request.Email
            .Trim()
            .ToLowerInvariant();


        // -----------------------------------------------------
        // CHECK EXISTING EMAIL
        // -----------------------------------------------------

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


        // -----------------------------------------------------
        // VALIDATE PROFILE IMAGE
        // -----------------------------------------------------

        string? profileImageUrl = null;

        if (request.ProfileImage is not null)
        {
            ValidateProfileImage(
                request.ProfileImage
            );


            // -------------------------------------------------
            // UPLOAD TO CLOUDINARY
            // -------------------------------------------------

            await using var stream =
                request.ProfileImage.OpenReadStream();

            profileImageUrl =
                await _cloudinaryService.UploadImageAsync(
                    stream,
                    request.ProfileImage.FileName,
                    "ace-nextgen/participants"
                );
        }


        // -----------------------------------------------------
        // GENERATE PARTICIPANT USER CODE
        // -----------------------------------------------------

        var userCode =
            await GenerateParticipantUserCodeAsync();


        // -----------------------------------------------------
        // CREATE FULL NAME
        // -----------------------------------------------------

        var fullName =
            BuildFullName(
                request.FirstName,
                request.MiddleName,
                request.LastName
            );


        // -----------------------------------------------------
        // CREATE USER
        // -----------------------------------------------------

        var user = new User
        {
            Id = Guid.NewGuid(),

            UserCode =
                userCode,

            FullName =
                fullName,

            Email =
                email,

            MobileNumber =
                CleanString(
                    request.MobileNumber
                ),

            PasswordHash =
                _passwordService.HashPassword(
                    request.Password
                ),

            Role =
                UserRole.Participant,

            // Account stays pending
            // until OTP verification.
            Status =
                UserStatus.Pending,

            IsEmailVerified =
                false,

            CreatedAt =
                DateTime.UtcNow,

            UpdatedAt =
                DateTime.UtcNow
        };


        // -----------------------------------------------------
        // CREATE PARTICIPANT PROFILE
        // -----------------------------------------------------

        var participantProfile =
            new ParticipantProfile
            {
                Id =
                    Guid.NewGuid(),

                UserId =
                    user.Id,

                FirstName =
                    request.FirstName.Trim(),

                MiddleName =
                    CleanString(
                        request.MiddleName
                    ),

                LastName =
                    request.LastName.Trim(),

                BirthDate =
                    request.BirthDate,

                Address =
                    CleanString(
                        request.Address
                    ),

                Gender =
                    CleanString(
                        request.Gender
                    ),

                ProfileImageUrl =
                    profileImageUrl,

                User =
                    user
            };


        // -----------------------------------------------------
        // ADD TO DATABASE
        // -----------------------------------------------------

        _db.Users.Add(user);

        _db.ParticipantProfiles.Add(
            participantProfile
        );


        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        await _db.SaveChangesAsync();


        // -----------------------------------------------------
        // RETURN RESPONSE
        // -----------------------------------------------------

        return new UserRegistrationResponse
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
                user.Status.ToString(),

            Message =
                "Participant registration successful. Please verify your email using the OTP.",
                
                TrainerApplicationId =
        null,

    ProfileImageUrl =
        profileImageUrl
        };
    }


    // =========================================================
    // TRAINER REGISTRATION
    // POST /api/auth/register/trainer
    // multipart/form-data
    // =========================================================

    public async Task<UserRegistrationResponse>
        RegisterTrainerAsync(
            RegisterTrainerRequest request)
    {
        // -----------------------------------------------------
        // NORMALIZE EMAIL
        // -----------------------------------------------------

        var email =
            request.Email
                .Trim()
                .ToLowerInvariant();


        // -----------------------------------------------------
        // CHECK EXISTING EMAIL
        // -----------------------------------------------------

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


        // -----------------------------------------------------
        // VALIDATE SPECIALIZATION
        // -----------------------------------------------------

        if (
            string.IsNullOrWhiteSpace(
                request.Specialization
            )
        )
        {
            throw new InvalidOperationException(
                "Specialization is required."
            );
        }


        // -----------------------------------------------------
        // VALIDATE PROFILE IMAGE
        // -----------------------------------------------------

        string? profileImageUrl = null;

        if (request.ProfileImage is not null)
        {
            ValidateProfileImage(
                request.ProfileImage
            );


            await using var stream =
                request.ProfileImage.OpenReadStream();


            profileImageUrl =
                await _cloudinaryService.UploadImageAsync(
                    stream,
                    request.ProfileImage.FileName,
                    "ace-nextgen/trainers"
                );
        }


        // -----------------------------------------------------
        // GENERATE TRAINER USER CODE
        // -----------------------------------------------------

        var userCode =
            await GenerateTrainerUserCodeAsync();


        // -----------------------------------------------------
        // CREATE USER
        // -----------------------------------------------------

        var user =
            new User
            {
                Id =
                    Guid.NewGuid(),

                UserCode =
                    userCode,

                FullName =
                    request.FullName.Trim(),

                Email =
                    email,

                MobileNumber =
                    CleanString(
                        request.MobileNumber
                    ),

                PasswordHash =
                    _passwordService.HashPassword(
                        request.Password
                    ),

                Role =
                    UserRole.Trainer,

                Status =
                    UserStatus.Pending,

                IsEmailVerified =
                    false,

                CreatedAt =
                    DateTime.UtcNow,

                UpdatedAt =
                    DateTime.UtcNow
            };


        // -----------------------------------------------------
        // CREATE TRAINER APPLICATION
        // -----------------------------------------------------

        var trainerApplication =
            new TrainerApplication
            {
                Id =
                    Guid.NewGuid(),

                UserId =
                    user.Id,

                Status =
                    TrainerApplicationStatus.Pending,

                Specialization =
                    request.Specialization.Trim(),

                YearsOfExperience =
                    request.YearsOfExperience,

                CertificationName =
                    CleanString(
                        request.CertificationName
                    ),

                CertificationNumber =
                    CleanString(
                        request.CertificationNumber
                    ),

                ProfileImageUrl =
                    profileImageUrl,

                AdminRemarks =
                    null,

                ReviewedByUserId =
                    null,

                ReviewedAt =
                    null,

                CreatedAt =
                    DateTime.UtcNow,

                SubmittedAt =
                    DateTime.UtcNow,

                User =
                    user
            };


        // -----------------------------------------------------
        // SAVE USER + TRAINER APPLICATION
        // -----------------------------------------------------

        _db.Users.Add(user);

        _db.TrainerApplications.Add(
            trainerApplication
        );


        await _db.SaveChangesAsync();


        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

        return new UserRegistrationResponse
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
                user.Status.ToString(),

            Message =
                "Trainer registration submitted successfully. Please verify your email.",
                ProfileImageUrl =
        profileImageUrl
        };
    }


    // =========================================================
    // LOGIN
    // POST /api/auth/login
    // =========================================================

    public async Task<LoginResponse>
        LoginAsync(
            LoginRequest request)
    {
        // -----------------------------------------------------
        // NORMALIZE EMAIL
        // -----------------------------------------------------

        var email =
            request.Email
                .Trim()
                .ToLowerInvariant();


        // -----------------------------------------------------
        // FIND USER
        // -----------------------------------------------------

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


        // -----------------------------------------------------
        // VERIFY PASSWORD
        // -----------------------------------------------------

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


        // -----------------------------------------------------
        // EMAIL VERIFICATION CHECK
        // -----------------------------------------------------

        if (!user.IsEmailVerified)
        {
            throw new UnauthorizedAccessException(
                "Please verify your email address before logging in."
            );
        }


        // -----------------------------------------------------
        // ACCOUNT STATUS CHECK
        // -----------------------------------------------------

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


        // -----------------------------------------------------
        // GENERATE JWT
        // -----------------------------------------------------

        var jwt =
            _jwtService.GenerateToken(
                user
            );


        // -----------------------------------------------------
        // RETURN LOGIN RESPONSE
        // -----------------------------------------------------

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


    // =========================================================
    // GENERATE PARTICIPANT CODE
    // =========================================================

    private async Task<string>
        GenerateParticipantUserCodeAsync()
    {
        var lastUserCode =
            await _db.Users
                .Where(
                    x =>
                        x.UserCode
                            .StartsWith("PAR-")
                )
                .OrderByDescending(
                    x => x.UserCode
                )
                .Select(
                    x => x.UserCode
                )
                .FirstOrDefaultAsync();


        var nextNumber = 1;


        if (
            !string.IsNullOrWhiteSpace(
                lastUserCode
            )
        )
        {
            var numberPart =
                lastUserCode.Replace(
                    "PAR-",
                    ""
                );


            if (
                int.TryParse(
                    numberPart,
                    out var currentNumber
                )
            )
            {
                nextNumber =
                    currentNumber + 1;
            }
        }


        return $"PAR-{nextNumber:D6}";
    }


    // =========================================================
    // GENERATE TRAINER CODE
    // =========================================================

    private async Task<string>
        GenerateTrainerUserCodeAsync()
    {
        var lastUserCode =
            await _db.Users
                .Where(
                    x =>
                        x.UserCode
                            .StartsWith("TRN-")
                )
                .OrderByDescending(
                    x => x.UserCode
                )
                .Select(
                    x => x.UserCode
                )
                .FirstOrDefaultAsync();


        var nextNumber = 1;


        if (
            !string.IsNullOrWhiteSpace(
                lastUserCode
            )
        )
        {
            var numberPart =
                lastUserCode.Replace(
                    "TRN-",
                    ""
                );


            if (
                int.TryParse(
                    numberPart,
                    out var currentNumber
                )
            )
            {
                nextNumber =
                    currentNumber + 1;
            }
        }


        return $"TRN-{nextNumber:D6}";
    }


    // =========================================================
    // BUILD FULL NAME
    // =========================================================

    private static string BuildFullName(
        string firstName,
        string? middleName,
        string lastName)
    {
        var parts =
            new[]
            {
                firstName,
                middleName,
                lastName
            }
            .Where(
                x =>
                    !string.IsNullOrWhiteSpace(x)
            )
            .Select(
                x => x!.Trim()
            );

        return string.Join(
            " ",
            parts
        );
    }


    // =========================================================
    // CLEAN OPTIONAL STRING
    // =========================================================

    private static string? CleanString(
        string? value)
    {
        if (
            string.IsNullOrWhiteSpace(
                value
            )
        )
        {
            return null;
        }

        return value.Trim();
    }


    // =========================================================
    // PROFILE IMAGE VALIDATION
    // =========================================================

    private static void ValidateProfileImage(
        Microsoft.AspNetCore.Http.IFormFile file)
    {
        const long maxFileSize =
            5 * 1024 * 1024;


        if (file.Length <= 0)
        {
            throw new InvalidOperationException(
                "Profile image is empty."
            );
        }


        if (file.Length > maxFileSize)
        {
            throw new InvalidOperationException(
                "Profile image must not exceed 5 MB."
            );
        }


        var allowedContentTypes =
            new[]
            {
                "image/jpeg",
                "image/png",
                "image/webp"
            };


        if (
            !allowedContentTypes.Contains(
                file.ContentType.ToLowerInvariant()
            )
        )
        {
            throw new InvalidOperationException(
                "Only JPG, PNG, and WEBP images are allowed."
            );
        }
    }
}