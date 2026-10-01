using System.IdentityModel.Tokens.Jwt;
using System.Text.Json;

using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Auth;
using server.DTOs.Otp;
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

    private readonly IOtpService _otpService;

    private readonly IGoogleAuthService _googleAuthService;

    public AuthService(
        ApplicationDbContext db,
        PasswordService passwordService,
        JwtService jwtService,
        ICloudinaryService cloudinaryService,
        IOtpService otpService,
        IGoogleAuthService googleAuthService)
    {
        _db = db;

        _googleAuthService =
            googleAuthService;

        _passwordService =
            passwordService;

        _jwtService =
            jwtService;

        _cloudinaryService =
            cloudinaryService;

        _otpService =
            otpService;
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
        GoogleLoginResponse? googleUser = null;

        // =====================================================
        // GOOGLE REGISTRATION
        // =====================================================

        if (!string.IsNullOrWhiteSpace(
            request.GoogleIdToken))
        {
            googleUser =
                await _googleAuthService
                    .ValidateTokenAsync(
                        request.GoogleIdToken
                    );
        }

        // =====================================================
        // NORMALIZE EMAIL
        // =====================================================

        var email =
            request.Email
                .Trim()
                .ToLowerInvariant();

        // =====================================================
        // GOOGLE EMAIL MUST MATCH
        // =====================================================

        if (googleUser is not null)
        {
            if (!string.Equals(
                email,
                googleUser.Email,
                StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "The registration email does not match the Google account."
                );
            }
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
        // PROFILE IMAGE
        // =====================================================

        string? profileImageUrl = null;

        if (googleUser is not null)
        {
            profileImageUrl =
                CleanString(
                    googleUser.ProfileImageUrl
                );

            // Fallback: extract picture directly
            // from the already validated Google token.
            if (string.IsNullOrWhiteSpace(
                profileImageUrl))
            {
                profileImageUrl =
                    ExtractGoogleProfileImage(
                        request.GoogleIdToken
                    );
            }

            Console.WriteLine(
                $"GOOGLE PARTICIPANT PROFILE IMAGE: {profileImageUrl}"
            );
        }

        // =====================================================
        // LOCAL IMAGE OVERRIDES GOOGLE IMAGE
        // =====================================================

        if (request.ProfileImage is not null)
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

            Console.WriteLine(
                $"CLOUDINARY PARTICIPANT PROFILE IMAGE: {profileImageUrl}"
            );
        }

        Console.WriteLine(
            $"FINAL PARTICIPANT PROFILE IMAGE: {profileImageUrl}"
        );

        // =====================================================
        // GENERATE PARTICIPANT USER CODE
        // =====================================================

        var userCode =
            await GenerateParticipantUserCodeAsync();

        // =====================================================
        // CREATE FULL NAME
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
                    UserRole.Participant,

                Status =
                    UserStatus.Pending,

                IsEmailVerified =
    false,

                GoogleSubjectId =
                    googleUser?.GoogleSubjectId,

                CreatedAt =
                    DateTime.UtcNow,

                UpdatedAt =
                    DateTime.UtcNow
            };

        // =====================================================
        // CREATE PARTICIPANT PROFILE
        // =====================================================

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

        // =====================================================
        // ADD DATABASE RECORDS
        // =====================================================

        _db.Users.Add(
            user
        );

        _db.ParticipantProfiles.Add(
            participantProfile
        );

        // =====================================================
        // SAVE
        // =====================================================

        await _db.SaveChangesAsync();
if (googleUser is not null)
{
    await _otpService.SendVerificationOtpAsync(
        new SendOtpRequest
        {
            Email = user.Email
        }
    );
}
        // =====================================================
        // RESPONSE
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
                googleUser is not null
                    ? "Participant registration successful."
                    : "Participant registration successful. Please verify your email using the OTP.",

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
        GoogleLoginResponse? googleUser = null;

        // =====================================================
        // GOOGLE REGISTRATION
        // =====================================================

        Console.WriteLine(
            "================================================="
        );

        Console.WriteLine(
            "🔥 TRAINER GOOGLE REGISTRATION"
        );

        Console.WriteLine(
            $"GoogleIdToken received: {!string.IsNullOrWhiteSpace(request.GoogleIdToken)}"
        );

        Console.WriteLine(
            $"GoogleIdToken length: {request.GoogleIdToken?.Length ?? 0}"
        );

        Console.WriteLine(
            "================================================="
        );

        if (!string.IsNullOrWhiteSpace(
            request.GoogleIdToken))
        {
            googleUser =
                await _googleAuthService
                    .ValidateTokenAsync(
                        request.GoogleIdToken
                    );

            Console.WriteLine(
                "================================================="
            );

            Console.WriteLine(
                "🔥 GOOGLE TOKEN VALIDATED FOR TRAINER"
            );

            Console.WriteLine(
                $"Google Subject: {googleUser?.GoogleSubjectId}"
            );

            Console.WriteLine(
                $"Google Email: {googleUser?.Email}"
            );

            Console.WriteLine(
                $"Google ProfileImageUrl: {googleUser?.ProfileImageUrl}"
            );

            Console.WriteLine(
                "================================================="
            );
        }

        // =====================================================
        // NORMALIZE EMAIL
        // =====================================================

        var email =
            request.Email
                .Trim()
                .ToLowerInvariant();

        // =====================================================
        // GOOGLE EMAIL MUST MATCH REGISTRATION EMAIL
        // =====================================================

        if (googleUser is not null)
        {
            if (!string.Equals(
                email,
                googleUser.Email,
                StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "The registration email does not match the Google account."
                );
            }
        }

        // =====================================================
        // VALIDATE EMAIL
        // =====================================================

        if (string.IsNullOrWhiteSpace(email))
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

        if (string.IsNullOrWhiteSpace(
            request.FirstName))
        {
            throw new InvalidOperationException(
                "First name is required."
            );
        }

        // =====================================================
        // VALIDATE LAST NAME
        // =====================================================

        if (string.IsNullOrWhiteSpace(
            request.LastName))
        {
            throw new InvalidOperationException(
                "Last name is required."
            );
        }

        // =====================================================
        // VALIDATE PASSWORD
        // =====================================================

        if (string.IsNullOrWhiteSpace(
            request.Password))
        {
            throw new InvalidOperationException(
                "Password is required."
            );
        }

        // =====================================================
        // VALIDATE SPECIALIZATION
        // =====================================================

        if (string.IsNullOrWhiteSpace(
            request.Specialization))
        {
            throw new InvalidOperationException(
                "Specialization is required."
            );
        }

        // =====================================================
        // VALIDATE ADDRESS
        // =====================================================

        if (string.IsNullOrWhiteSpace(
            request.Address))
        {
            throw new InvalidOperationException(
                "Address is required."
            );
        }

        // =====================================================
        // VALIDATE GENDER
        // =====================================================

        if (string.IsNullOrWhiteSpace(
            request.Gender))
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

        // -----------------------------------------------------
        // GOOGLE PROFILE IMAGE
        // -----------------------------------------------------

        if (googleUser is not null)
        {
            profileImageUrl =
                CleanString(
                    googleUser.ProfileImageUrl
                );

            Console.WriteLine(
                $"GOOGLE IMAGE FROM RESPONSE: {profileImageUrl}"
            );

            // -------------------------------------------------
            // FALLBACK:
            // Read picture directly from validated ID token.
            // -------------------------------------------------

            if (string.IsNullOrWhiteSpace(
                profileImageUrl))
            {
                profileImageUrl =
                    ExtractGoogleProfileImage(
                        request.GoogleIdToken
                    );

                Console.WriteLine(
                    $"GOOGLE IMAGE FROM TOKEN: {profileImageUrl}"
                );
            }
        }

        // -----------------------------------------------------
        // LOCAL IMAGE
        // -----------------------------------------------------
        // Local uploaded image has priority over Google image.
        // -----------------------------------------------------

        if (request.ProfileImage is not null)
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
                        "ace-nextgen/trainers"
                    );

            Console.WriteLine(
                $"CLOUDINARY TRAINER PROFILE IMAGE: {profileImageUrl}"
            );
        }

        Console.WriteLine(
            "================================================="
        );

        Console.WriteLine(
            "TRAINER PROFILE IMAGE RESULT"
        );

        Console.WriteLine(
            $"GOOGLE IMAGE: {googleUser?.ProfileImageUrl}"
        );

        Console.WriteLine(
            $"FINAL IMAGE: {profileImageUrl}"
        );

        Console.WriteLine(
            $"LOCAL IMAGE: {request.ProfileImage?.FileName ?? "NONE"}"
        );

        Console.WriteLine(
            "================================================="
        );

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

                Status =
                    UserStatus.Pending,

                IsEmailVerified =
                    googleUser is not null,

                GoogleSubjectId =
                    googleUser?.GoogleSubjectId,

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

                FirstName =
                    request.FirstName.Trim(),

                MiddleName =
                    CleanString(
                        request.MiddleName
                    ),

                LastName =
                    request.LastName.Trim(),

                Suffix =
                    CleanString(
                        request.Suffix
                    ),

                BirthDate =
                    request.BirthDate,

                Gender =
                    CleanString(
                        request.Gender
                    ),

                Address =
                    CleanString(
                        request.Address
                    ),

                Specialization =
                    request.Specialization.Trim(),

                ProfessionalTitle =
                    CleanString(
                        request.ProfessionalTitle
                    ),

                CurrentOrganization =
                    CleanString(
                        request.CurrentOrganization
                    ),

                Bio =
                    CleanString(
                        request.Bio
                    ),

                YearsOfExperience =
                    request.YearsOfExperience,

                ProfessionalLicenseNumber =
                    CleanString(
                        request.ProfessionalLicenseNumber
                    ),

                ProfessionalLicenseType =
                    CleanString(
                        request.ProfessionalLicenseType
                    ),

                ProfessionalLicenseExpirationDate =
                    request.ProfessionalLicenseExpirationDate,

                // =================================================
                // IMPORTANT
                // =================================================

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
        // DEBUG BEFORE DATABASE SAVE
        // =====================================================

        Console.WriteLine(
            "================================================="
        );

        Console.WriteLine(
            "🔥 TRAINER REGISTRATION DATABASE IMAGE"
        );

        Console.WriteLine(
            $"Google Response Image: {googleUser?.ProfileImageUrl}"
        );

        Console.WriteLine(
            $"Final Profile Image: {profileImageUrl}"
        );

        Console.WriteLine(
            $"Application Profile Image: {trainerApplication.ProfileImageUrl}"
        );

        Console.WriteLine(
            "================================================="
        );

        // =====================================================
        // CREATE EDUCATION RECORDS
        // =====================================================

        if (request.Educations is not null)
        {
            foreach (
                var education
                in request.Educations)
            {
                trainerApplication.Educations.Add(
                    new TrainerApplicationEducation
                    {
                        Id =
                            Guid.NewGuid(),

                        TrainerApplicationId =
                            trainerApplication.Id,

                        Degree =
                            education.Degree.Trim(),

                        FieldOfStudy =
                            CleanString(
                                education.FieldOfStudy
                            ),

                        Institution =
                            education.Institution.Trim(),

                        YearGraduated =
                            education.YearGraduated
                    }
                );
            }
        }

        // =====================================================
        // CREATE CERTIFICATION RECORDS
        // =====================================================

        if (request.Certifications is not null)
        {
            foreach (
                var certification
                in request.Certifications)
            {
                trainerApplication.Certifications.Add(
                    new TrainerApplicationCertification
                    {
                        Id =
                            Guid.NewGuid(),

                        TrainerApplicationId =
                            trainerApplication.Id,

                        Name =
                            certification.Name.Trim(),

                        IssuingOrganization =
                            CleanString(
                                certification.IssuingOrganization
                            ),

                        IssuedDate =
                            certification.IssuedDate,

                        ExpirationDate =
                            certification.ExpirationDate,

                        CertificateUrl =
                            CleanString(
                                certification.CertificateUrl
                            )
                    }
                );
            }
        }

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
        // SAVE DATABASE
        // =====================================================

        await _db.SaveChangesAsync();

        // =====================================================
        // RESPONSE
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
                googleUser is not null
                    ? "Trainer registration submitted successfully."
                    : "Trainer registration submitted successfully. Please verify your email using the OTP.",

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

        // =====================================================
        // EMAIL VERIFICATION
        // =====================================================

        if (!user.IsEmailVerified)
        {
            throw new UnauthorizedAccessException(
                "Please verify your email address before logging in."
            );
        }

        // =====================================================
        // JWT
        // =====================================================

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
                        user.Status.ToString()
                }
        };
    }

    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    public async Task<OtpResponse>
        ForgotPasswordAsync(
            ForgotPasswordRequest request)
    {
        var email =
            request.Email
                .Trim()
                .ToLowerInvariant();

        return await _otpService
            .SendPasswordResetOtpAsync(
                new SendOtpRequest
                {
                    Email =
                        email
                }
            );
    }

    // =========================================================
    // VERIFY PASSWORD RESET OTP
    // =========================================================

    public async Task<OtpResponse>
        VerifyPasswordResetOtpAsync(
            VerifyResetOtpRequest request)
    {
        var email =
            request.Email
                .Trim()
                .ToLowerInvariant();

        return await _otpService
            .VerifyPasswordResetOtpAsync(
                new VerifyOtpRequest
                {
                    Email =
                        email,

                    OtpCode =
                        request.OtpCode
                }
            );
    }

    // =========================================================
    // RESET PASSWORD
    // =========================================================

    public async Task<OtpResponse>
        ResetPasswordAsync(
            ResetPasswordRequest request)
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
            return new OtpResponse
            {
                Success = false,

                Message =
                    "Unable to reset password."
            };
        }

        var otp =
            await _db.OtpVerifications
                .Where(
                    x =>
                        x.UserId == user.Id
                        &&
                        x.Purpose ==
                            OtpPurpose.PasswordReset
                        &&
                        x.OtpCode ==
                            request.OtpCode
                        &&
                        x.IsUsed
                )
                .OrderByDescending(
                    x =>
                        x.VerifiedAt
                )
                .FirstOrDefaultAsync();

        if (otp is null)
        {
            return new OtpResponse
            {
                Success = false,

                Message =
                    "Invalid or unverified password reset OTP."
            };
        }

        if (
            otp.ExpiresAt <=
            DateTime.UtcNow
        )
        {
            return new OtpResponse
            {
                Success = false,

                Message =
                    "The password reset OTP has expired."
            };
        }

        user.PasswordHash =
            _passwordService
                .HashPassword(
                    request.NewPassword
                );

        user.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return new OtpResponse
        {
            Success = true,

            Message =
                "Password reset successfully."
        };
    }

    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    public async Task<OtpResponse>
        ChangePasswordAsync(
            Guid userId,
            ChangePasswordRequest request)
    {
        var user =
            await _db.Users
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == userId
                );

        if (user is null)
        {
            return new OtpResponse
            {
                Success = false,

                Message =
                    "User account not found."
            };
        }

        var currentPasswordValid =
            _passwordService
                .VerifyPassword(
                    request.CurrentPassword,
                    user.PasswordHash
                );

        if (!currentPasswordValid)
        {
            return new OtpResponse
            {
                Success = false,

                Message =
                    "Current password is incorrect."
            };
        }

        var samePassword =
            _passwordService
                .VerifyPassword(
                    request.NewPassword,
                    user.PasswordHash
                );

        if (samePassword)
        {
            return new OtpResponse
            {
                Success = false,

                Message =
                    "New password must be different from your current password."
            };
        }

        user.PasswordHash =
            _passwordService
                .HashPassword(
                    request.NewPassword
                );

        user.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return new OtpResponse
        {
            Success = true,

            Message =
                "Password changed successfully."
        };
    }

    // =========================================================
    // GENERATE PARTICIPANT USER CODE
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
    // GENERATE TRAINER USER CODE
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
    // EXTRACT GOOGLE PROFILE IMAGE
    //
    // IMPORTANT:
    // The Google ID token has already been validated by
    // GoogleAuthService before this method is called.
    //
    // We only read the "picture" claim here.
    // =========================================================

    private static string? ExtractGoogleProfileImage(
        string? idToken)
    {
        if (
            string.IsNullOrWhiteSpace(
                idToken
            )
        )
        {
            return null;
        }

        try
        {
            var handler =
                new JwtSecurityTokenHandler();

            var token =
                handler.ReadJwtToken(
                    idToken
                );

            var picture =
                token.Claims
                    .FirstOrDefault(
                        x =>
                            x.Type == "picture"
                    )
                    ?.Value;

            var cleanedPicture =
                CleanString(
                    picture
                );

            Console.WriteLine(
                $"GOOGLE TOKEN PICTURE CLAIM: {cleanedPicture}"
            );

            return cleanedPicture;
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Unable to extract Google picture claim: {ex.Message}"
            );

            return null;
        }
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