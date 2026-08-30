using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Auth;
using server.DTOs.Trainer;
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

        _passwordService =
            passwordService;

        _jwtService =
            jwtService;

        _cloudinaryService =
            cloudinaryService;
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
                    x =>
                        x.Email == email
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


        if (
            request.ProfileImage is not null
        )
        {
            ValidateProfileImage(
                request.ProfileImage
            );


            await using var stream =
                request.ProfileImage.OpenReadStream();


            profileImageUrl =
                await _cloudinaryService
                    .UploadImageAsync(
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

        var user =
            new User
            {
                Id =
                    Guid.NewGuid(),

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
                    _passwordService
                        .HashPassword(
                            request.Password
                        ),

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

        _db.Users.Add(
            user
        );

        _db.ParticipantProfiles.Add(
            participantProfile
        );


        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

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
        // =====================================================
        // NORMALIZE EMAIL
        // =====================================================

        var email =
            request.Email
                .Trim()
                .ToLowerInvariant();


        // =====================================================
        // VALIDATE EMAIL
        // =====================================================

        if (
            string.IsNullOrWhiteSpace(email)
        )
        {
            throw new InvalidOperationException(
                "Email is required."
            );
        }


        // =====================================================
        // CHECK EXISTING EMAIL
        // =====================================================

        var existingUser =
            await _db.Users
                .FirstOrDefaultAsync(
                    x =>
                        x.Email == email
                );


        if (existingUser is not null)
        {
            throw new InvalidOperationException(
                "An account with this email already exists."
            );
        }


        // =====================================================
        // VALIDATE FIRST NAME
        // =====================================================

        if (
            string.IsNullOrWhiteSpace(
                request.FirstName
            )
        )
        {
            throw new InvalidOperationException(
                "First name is required."
            );
        }


        // =====================================================
        // VALIDATE LAST NAME
        // =====================================================

        if (
            string.IsNullOrWhiteSpace(
                request.LastName
            )
        )
        {
            throw new InvalidOperationException(
                "Last name is required."
            );
        }


        // =====================================================
        // VALIDATE PASSWORD
        // =====================================================

        if (
            string.IsNullOrWhiteSpace(
                request.Password
            )
        )
        {
            throw new InvalidOperationException(
                "Password is required."
            );
        }


        // =====================================================
        // VALIDATE SPECIALIZATION
        // =====================================================

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


        // =====================================================
        // VALIDATE ADDRESS
        // =====================================================

        if (
            string.IsNullOrWhiteSpace(
                request.Address
            )
        )
        {
            throw new InvalidOperationException(
                "Address is required."
            );
        }


        // =====================================================
        // VALIDATE GENDER
        // =====================================================

        if (
            string.IsNullOrWhiteSpace(
                request.Gender
            )
        )
        {
            throw new InvalidOperationException(
                "Gender is required."
            );
        }


        // =====================================================
        // VALIDATE YEARS OF EXPERIENCE
        // =====================================================

        if (
            request.YearsOfExperience.HasValue
            &&
            (
                request.YearsOfExperience.Value < 0
                ||
                request.YearsOfExperience.Value > 100
            )
        )
        {
            throw new InvalidOperationException(
                "Years of experience must be between 0 and 100."
            );
        }


        // =====================================================
        // PROFILE IMAGE
        // =====================================================

        string? profileImageUrl = null;


        if (
            request.ProfileImage is not null
        )
        {
            ValidateProfileImage(
                request.ProfileImage
            );


            await using var stream =
                request.ProfileImage
                    .OpenReadStream();


            profileImageUrl =
                await _cloudinaryService
                    .UploadImageAsync(
                        stream,
                        request.ProfileImage.FileName,
                        "ace-nextgen/trainers"
                    );
        }


        // =====================================================
        // GENERATE TRAINER USER CODE
        // =====================================================

        var userCode =
            await GenerateTrainerUserCodeAsync();


        // =====================================================
        // BUILD FULL NAME
        // =====================================================

        var fullName =
            BuildFullName(
                request.FirstName,
                request.MiddleName,
                request.LastName
            );


        // =====================================================
        // CREATE USER
        // =====================================================

        var user =
            new User
            {
                Id =
                    Guid.NewGuid(),

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
                    _passwordService
                        .HashPassword(
                            request.Password
                        ),

                Role =
                    UserRole.Trainer,

                // Trainer still needs
                // email verification and
                // admin approval.
                Status =
                    UserStatus.Pending,

                IsEmailVerified =
                    false,

                CreatedAt =
                    DateTime.UtcNow,

                UpdatedAt =
                    DateTime.UtcNow
            };


        // =====================================================
        // CREATE TRAINER APPLICATION
        // =====================================================

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


        // =====================================================
        // CREATE TRAINER PROFILE
        // =====================================================
        //
        // IMPORTANT:
        // This is what was missing from your current code.
        //
        // The trainer profile is created immediately during
        // registration, but it remains inactive until admin
        // approval.
        // =====================================================

        var trainerProfile =
            new TrainerProfile
            {
                Id =
                    Guid.NewGuid(),

                UserId =
                    user.Id,


                // -------------------------------------------------
                // PERSONAL INFORMATION
                // -------------------------------------------------

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


                // -------------------------------------------------
                // TRAINER INFORMATION
                // -------------------------------------------------

                IsActive =
                    false,

                Specialization =
                    request.Specialization.Trim(),

                Bio =
                    CleanString(
                        request.Bio
                    ),

                YearsOfExperience =
                    request.YearsOfExperience,


                // -------------------------------------------------
                // PROFILE IMAGE
                // -------------------------------------------------

                ProfileImageUrl =
                    profileImageUrl,


                // -------------------------------------------------
                // ACTIVATION
                // -------------------------------------------------

                ActivatedAt =
                    null,


                // -------------------------------------------------
                // RELATIONSHIP
                // -------------------------------------------------

                User =
                    user
            };


        // =====================================================
        // ADD USER
        // =====================================================

        _db.Users.Add(
            user
        );


        // =====================================================
        // ADD TRAINER APPLICATION
        // =====================================================

        _db.TrainerApplications.Add(
            trainerApplication
        );


        // =====================================================
        // ADD TRAINER PROFILE
        // =====================================================

        _db.TrainerProfiles.Add(
            trainerProfile
        );


        // =====================================================
        // SAVE DATABASE
        // =====================================================

        await _db.SaveChangesAsync();


        // =====================================================
        // RETURN RESPONSE
        // =====================================================

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
                "Trainer registration submitted successfully. Please verify your email using the OTP.",

            TrainerApplicationId =
                trainerApplication.Id,

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
   

    var email =
        request.Email
            .Trim()
            .ToLowerInvariant();


   

    var user =
        await _db.Users
            .FirstOrDefaultAsync(
                x =>
                    x.Email == email
            );



    if (user is null)
    {
        throw new UnauthorizedAccessException(
            "Invalid email or password."
        );
    }


   
    var passwordValid =
        _passwordService
            .VerifyPassword(
                request.Password,
                user.PasswordHash
            );


    if (!passwordValid)
    {
        throw new UnauthorizedAccessException(
            "Invalid email or password."
        );
    }


    if (!user.IsEmailVerified)
    {
        throw new UnauthorizedAccessException(
            "Please verify your email address before logging in."
        );
    }
   
        var trainerProfile =
            await _db.TrainerProfiles
                .FirstOrDefaultAsync(
                    x =>
                        x.UserId ==
                        user.Id
                );
       

        var jwt =
            _jwtService.GenerateToken(
                user
            );

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
                        user.Status.ToString(),

                }
        };
    }



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
                    x =>
                        x.UserCode
                )
                .Select(
                    x =>
                        x.UserCode
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
                    x =>
                        x.UserCode
                )
                .Select(
                    x =>
                        x.UserCode
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
                x =>
                    x!.Trim()
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
    // VALIDATE PROFILE IMAGE
    // =========================================================

    private static void ValidateProfileImage(
        Microsoft.AspNetCore.Http.IFormFile file)
    {
        const long maxFileSize =
            5 * 1024 * 1024;


        if (
            file.Length <= 0
        )
        {
            throw new InvalidOperationException(
                "Profile image is empty."
            );
        }


        if (
            file.Length > maxFileSize
        )
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
                file.ContentType
                    .ToLowerInvariant()
            )
        )
        {
            throw new InvalidOperationException(
                "Only JPG, PNG, and WEBP images are allowed."
            );
        }
    }
}