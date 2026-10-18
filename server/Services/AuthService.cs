
using System.IdentityModel.Tokens.Jwt;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Auth;
using server.DTOs.Otp;
using server.DTOs.Trainer;
using server.Enums;
using server.Interfaces;
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
    private readonly ICacheService _cacheService;

    public AuthService(
        ApplicationDbContext db,
        PasswordService passwordService,
        JwtService jwtService,
        ICloudinaryService cloudinaryService,
        ICacheService cacheService,
        IOtpService otpService,
        IGoogleAuthService googleAuthService)
    {
        _db = db;
        _passwordService = passwordService;
        _jwtService = jwtService;
        _cloudinaryService = cloudinaryService;
        _cacheService = cacheService;
        _otpService = otpService;
        _googleAuthService = googleAuthService;
    }

    // =========================================================
    // PARTICIPANT REGISTRATION
    // POST /api/auth/register
    // multipart/form-data
    // =========================================================

    public async Task<UserRegistrationResponse> RegisterParticipantAsync(
        RegisterParticipantRequest request)
    {
        GoogleLoginResponse? googleUser = null;

        // =====================================================
        // GOOGLE REGISTRATION
        // =====================================================

        if (!string.IsNullOrWhiteSpace(request.GoogleIdToken))
        {
            googleUser = await _googleAuthService.ValidateTokenAsync(
                request.GoogleIdToken);
        }

        // =====================================================
        // NORMALIZE EMAIL
        // =====================================================

        var email = request.Email.Trim().ToLowerInvariant();

        // =====================================================
        // GOOGLE EMAIL MUST MATCH
        // =====================================================

        if (googleUser is not null &&
            !string.Equals(
                email,
                googleUser.Email,
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "The registration email does not match the Google account.");
        }

        // =====================================================
        // CHECK EXISTING EMAIL
        // =====================================================

        var existingUser = await _db.Users
            .FirstOrDefaultAsync(x => x.Email == email);

        if (existingUser is not null)
        {
            throw new InvalidOperationException(
                "An account with this email already exists.");
        }

        // =====================================================
        // PROFILE IMAGE
        // =====================================================

        string? profileImageUrl = null;

        if (googleUser is not null)
        {
            profileImageUrl = CleanString(googleUser.ProfileImageUrl);

            // Fallback: extract picture directly from the
            // already validated Google token.
            if (string.IsNullOrWhiteSpace(profileImageUrl))
            {
                profileImageUrl = ExtractGoogleProfileImage(
                    request.GoogleIdToken);
            }

            Console.WriteLine(
                $"GOOGLE PARTICIPANT PROFILE IMAGE: {profileImageUrl}");
        }

        // =====================================================
        // LOCAL IMAGE OVERRIDES GOOGLE IMAGE
        // =====================================================

        if (request.ProfileImage is not null)
        {
            ValidateProfileImage(request.ProfileImage);

            await using var stream =
                request.ProfileImage.OpenReadStream();

            profileImageUrl = await _cloudinaryService.UploadImageAsync(
                stream,
                request.ProfileImage.FileName,
                "ace-nextgen/participants");
        }

        Console.WriteLine(
            $"FINAL PARTICIPANT PROFILE IMAGE: {profileImageUrl}");

        // =====================================================
        // VALID ID INFORMATION
        // =====================================================

        string? validIdImageUrl = null;

        var validIdType = CleanString(request.ValidIdType);
        var validIdNumber = CleanString(request.ValidIdNumber);

        if (request.ValidIdImage is not null)
        {
            if (string.IsNullOrWhiteSpace(validIdType))
            {
                throw new InvalidOperationException(
                    "Please select a valid ID type.");
            }

            ValidateValidIdImage(request.ValidIdImage);

            await using var validIdStream =
                request.ValidIdImage.OpenReadStream();

            validIdImageUrl = await _cloudinaryService.UploadImageAsync(
                validIdStream,
                request.ValidIdImage.FileName,
                "ace-nextgen/participants/valid-ids");
        }
        else if (
            !string.IsNullOrWhiteSpace(validIdType) ||
            !string.IsNullOrWhiteSpace(validIdNumber))
        {
            throw new InvalidOperationException(
                "Please upload an image of your valid ID.");
        }

        // =====================================================
        // GENERATE PARTICIPANT USER CODE
        // =====================================================

        var userCode = await GenerateParticipantUserCodeAsync();

        // =====================================================
        // CREATE FULL NAME
        // =====================================================

        var fullName = BuildFullName(
            request.FirstName,
            request.MiddleName,
            request.LastName);

        // =====================================================
        // CREATE USER
        // =====================================================

        var user = new User
        {
            Id = Guid.NewGuid(),
            UserCode = userCode,
            FullName = fullName,
            Email = email,

            MobileNumber = CleanString(request.MobileNumber),

            PasswordHash = _passwordService.HashPassword(
                request.Password),

            Role = UserRole.Participant,
            Status = UserStatus.Pending,
            IsEmailVerified = false,
            GoogleSubjectId = googleUser?.GoogleSubjectId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // =====================================================
        // CREATE PARTICIPANT PROFILE
        // =====================================================

        var participantProfile = new ParticipantProfile
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,

            // Personal Information
            FirstName = request.FirstName.Trim(),
            MiddleName = CleanString(request.MiddleName),
            LastName = request.LastName.Trim(),
            BirthDate = request.BirthDate,
            Address = CleanString(request.Address),
            Gender = CleanString(request.Gender),
            ProfileImageUrl = profileImageUrl,

            // Educational Information
            HighestEducationalAttainment =
                CleanString(request.HighestEducationalAttainment),

            EducationalStatus =
                CleanString(request.EducationalStatus),

            SchoolName = CleanString(request.SchoolName),
            CourseOrDegree = CleanString(request.CourseOrDegree),
            FieldOfStudy = CleanString(request.FieldOfStudy),
            YearGraduated = request.YearGraduated,

            // Employment Information
            EmploymentStatus = CleanString(request.EmploymentStatus),
            CompanyName = CleanString(request.CompanyName),
            JobTitle = CleanString(request.JobTitle),
            Industry = CleanString(request.Industry),
            YearsOfWorkExperience = request.YearsOfWorkExperience,

            // Valid ID Information
            ValidIdType = validIdType,
            ValidIdNumber = validIdNumber,
            ValidIdImageUrl = validIdImageUrl,

            ValidIdVerificationStatus =
                validIdImageUrl is not null
                    ? "Pending"
                    : "NotSubmitted",

            ValidIdRemarks = null,
            ValidIdVerifiedAt = null,
            ValidIdVerifiedBy = null,

            // Emergency Contact Information
            EmergencyContactName =
                CleanString(request.EmergencyContactName),

            EmergencyContactNumber =
                CleanString(request.EmergencyContactNumber),

            EmergencyContactRelationship =
                CleanString(request.EmergencyContactRelationship),

            User = user
        };

        // =====================================================
        // ADD DATABASE RECORDS
        // =====================================================

        _db.Users.Add(user);
        _db.ParticipantProfiles.Add(participantProfile);

        // =====================================================
        // SAVE DATABASE
        // =====================================================

        await _db.SaveChangesAsync();

        // =====================================================
        // SEND OTP
        // =====================================================

        if (googleUser is not null)
        {
            await _otpService.SendVerificationOtpAsync(
                new SendOtpRequest
                {
                    Email = user.Email
                });
        }

        // =====================================================
        // RESPONSE
        // =====================================================

        return new UserRegistrationResponse
        {
            Id = user.Id,
            UserCode = user.UserCode,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            Status = user.Status.ToString(),

            Message = googleUser is not null
                ? "Participant registration successful."
                : "Participant registration successful. Please verify your email using the OTP.",

            TrainerApplicationId = null,
            ProfileImageUrl = profileImageUrl
        };
    }

    // =========================================================
    // TRAINER REGISTRATION
    // =========================================================

    public async Task<UserRegistrationResponse> RegisterTrainerAsync(
        RegisterTrainerRequest request)
    {
        GoogleLoginResponse? googleUser = null;

        Console.WriteLine("=================================================");
        Console.WriteLine("TRAINER GOOGLE REGISTRATION");
        Console.WriteLine(
            $"GoogleIdToken received: {!string.IsNullOrWhiteSpace(request.GoogleIdToken)}");
        Console.WriteLine(
            $"GoogleIdToken length: {request.GoogleIdToken?.Length ?? 0}");
        Console.WriteLine("=================================================");

        if (!string.IsNullOrWhiteSpace(request.GoogleIdToken))
        {
            googleUser = await _googleAuthService.ValidateTokenAsync(
                request.GoogleIdToken);

            Console.WriteLine("=================================================");
            Console.WriteLine("GOOGLE TOKEN VALIDATED FOR TRAINER");
            Console.WriteLine($"Google Subject: {googleUser?.GoogleSubjectId}");
            Console.WriteLine($"Google Email: {googleUser?.Email}");
            Console.WriteLine(
                $"Google ProfileImageUrl: {googleUser?.ProfileImageUrl}");
            Console.WriteLine("=================================================");
        }

        // Normalize email
        var email = request.Email.Trim().ToLowerInvariant();

        // Google email must match registration email
        if (googleUser is not null &&
            !string.Equals(
                email,
                googleUser.Email,
                StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "The registration email does not match the Google account.");
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            throw new InvalidOperationException("Email is required.");
        }

        // Check existing email
        var existingUser = await _db.Users
            .FirstOrDefaultAsync(x => x.Email == email);

        if (existingUser is not null)
        {
            throw new InvalidOperationException(
                "An account with this email already exists.");
        }

        // Validate required fields
        if (string.IsNullOrWhiteSpace(request.FirstName))
        {
            throw new InvalidOperationException(
                "First name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.LastName))
        {
            throw new InvalidOperationException(
                "Last name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Password))
        {
            throw new InvalidOperationException(
                "Password is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Specialization))
        {
            throw new InvalidOperationException(
                "Specialization is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Address))
        {
            throw new InvalidOperationException(
                "Address is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Gender))
        {
            throw new InvalidOperationException(
                "Gender is required.");
        }

        if (request.YearsOfExperience.HasValue &&
            (request.YearsOfExperience.Value < 0 ||
             request.YearsOfExperience.Value > 100))
        {
            throw new InvalidOperationException(
                "Years of experience must be between 0 and 100.");
        }

        // =====================================================
        // TRAINER PROFILE IMAGE
        // =====================================================

        string? profileImageUrl = null;

        if (googleUser is not null)
        {
            profileImageUrl = CleanString(googleUser.ProfileImageUrl);

            if (string.IsNullOrWhiteSpace(profileImageUrl))
            {
                profileImageUrl = ExtractGoogleProfileImage(
                    request.GoogleIdToken);
            }
        }

        // Local image overrides Google image
        if (request.ProfileImage is not null)
        {
            ValidateProfileImage(request.ProfileImage);

            await using var stream =
                request.ProfileImage.OpenReadStream();

            profileImageUrl = await _cloudinaryService.UploadImageAsync(
                stream,
                request.ProfileImage.FileName,
                "ace-nextgen/trainers");
        }

        Console.WriteLine("=================================================");
        Console.WriteLine("TRAINER PROFILE IMAGE RESULT");
        Console.WriteLine($"GOOGLE IMAGE: {googleUser?.ProfileImageUrl}");
        Console.WriteLine($"FINAL IMAGE: {profileImageUrl}");
        Console.WriteLine(
            $"LOCAL IMAGE: {request.ProfileImage?.FileName ?? "NONE"}");
        Console.WriteLine("=================================================");

        // =====================================================
        // GENERATE TRAINER USER CODE
        // =====================================================

        var userCode = await GenerateTrainerUserCodeAsync();

        // =====================================================
        // BUILD FULL NAME
        // =====================================================

        var fullName = BuildFullName(
            request.FirstName,
            request.MiddleName,
            request.LastName);

        // =====================================================
        // CREATE USER
        // =====================================================

        var user = new User
        {
            Id = Guid.NewGuid(),
            UserCode = userCode,
            FullName = fullName,
            Email = email,

            MobileNumber = CleanString(request.MobileNumber),

            PasswordHash = _passwordService.HashPassword(
                request.Password),

            Role = UserRole.Trainer,
            Status = UserStatus.Pending,
            IsEmailVerified = googleUser is not null,
            GoogleSubjectId = googleUser?.GoogleSubjectId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // =====================================================
        // CREATE TRAINER APPLICATION
        // =====================================================

        var trainerApplication = new TrainerApplication
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Status = TrainerApplicationStatus.Pending,

            FirstName = request.FirstName.Trim(),
            MiddleName = CleanString(request.MiddleName),
            LastName = request.LastName.Trim(),
            Suffix = CleanString(request.Suffix),
            BirthDate = request.BirthDate,
            Gender = CleanString(request.Gender),
            Address = CleanString(request.Address),
            Specialization = request.Specialization.Trim(),
            ProfessionalTitle = CleanString(request.ProfessionalTitle),
            CurrentOrganization = CleanString(request.CurrentOrganization),
            Bio = CleanString(request.Bio),
            YearsOfExperience = request.YearsOfExperience,

            ProfessionalLicenseNumber =
                CleanString(request.ProfessionalLicenseNumber),

            ProfessionalLicenseType =
                CleanString(request.ProfessionalLicenseType),

            ProfessionalLicenseExpirationDate =
                request.ProfessionalLicenseExpirationDate,

            ProfileImageUrl = profileImageUrl,
            AdminRemarks = null,
            ReviewedByUserId = null,
            ReviewedAt = null,
            CreatedAt = DateTime.UtcNow,
            SubmittedAt = DateTime.UtcNow,
            User = user
        };

        // =====================================================
        // CREATE TRAINER PROFILE
        // =====================================================

        var trainerProfile = new TrainerProfile
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,

            FirstName = request.FirstName.Trim(),
            MiddleName = CleanString(request.MiddleName),
            LastName = request.LastName.Trim(),
            Suffix = CleanString(request.Suffix),
            BirthDate = request.BirthDate,
            Gender = CleanString(request.Gender),
            MobileNumber = CleanString(request.MobileNumber),
            Address = CleanString(request.Address),
            Specialization = request.Specialization.Trim(),
            ProfessionalTitle = CleanString(request.ProfessionalTitle),
            CurrentOrganization = CleanString(request.CurrentOrganization),
            Bio = CleanString(request.Bio),
            YearsOfExperience = request.YearsOfExperience,

            ProfessionalLicenseNumber =
                CleanString(request.ProfessionalLicenseNumber),

            ProfessionalLicenseType =
                CleanString(request.ProfessionalLicenseType),

            ProfessionalLicenseExpirationDate =
                request.ProfessionalLicenseExpirationDate,

            ProfileImageUrl = profileImageUrl,

            IsActive = false,
            ActivatedAt = null,
            User = user
        };

        Console.WriteLine("=================================================");
        Console.WriteLine("TRAINER REGISTRATION DATABASE IMAGE");
        Console.WriteLine($"Google Response Image: {googleUser?.ProfileImageUrl}");
        Console.WriteLine($"Final Profile Image: {profileImageUrl}");
        Console.WriteLine(
            $"Application Profile Image: {trainerApplication.ProfileImageUrl}");
        Console.WriteLine(
            $"Trainer Profile Image: {trainerProfile.ProfileImageUrl}");
        Console.WriteLine(
            $"Trainer Profile IsActive: {trainerProfile.IsActive}");
        Console.WriteLine("=================================================");

        // =====================================================
        // CREATE EDUCATION RECORDS
        // =====================================================

        if (request.Educations is not null)
        {
            foreach (var education in request.Educations)
            {
                trainerApplication.Educations.Add(
                    new TrainerApplicationEducation
                    {
                        Id = Guid.NewGuid(),
                        TrainerApplicationId = trainerApplication.Id,
                        Degree = education.Degree.Trim(),
                        FieldOfStudy = CleanString(education.FieldOfStudy),
                        Institution = education.Institution.Trim(),
                        YearGraduated = education.YearGraduated
                    });
            }
        }

        // =====================================================
        // CREATE CERTIFICATION RECORDS
        // =====================================================

        if (request.Certifications is not null)
        {
            foreach (var certification in request.Certifications)
            {
                trainerApplication.Certifications.Add(
                    new TrainerApplicationCertification
                    {
                        Id = Guid.NewGuid(),
                        TrainerApplicationId = trainerApplication.Id,
                        Name = certification.Name.Trim(),

                        IssuingOrganization =
                            CleanString(certification.IssuingOrganization),

                        IssuedDate = certification.IssuedDate,
                        ExpirationDate = certification.ExpirationDate,

                        CertificateUrl =
                            CleanString(certification.CertificateUrl)
                    });
            }
        }

        // =====================================================
        // ADD DATABASE RECORDS
        // =====================================================

        _db.Users.Add(user);
        _db.TrainerApplications.Add(trainerApplication);
        _db.TrainerProfiles.Add(trainerProfile);

        await _db.SaveChangesAsync();

        // =====================================================
        // RESPONSE
        // =====================================================

        return new UserRegistrationResponse
        {
            Id = user.Id,
            UserCode = user.UserCode,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role.ToString(),
            Status = user.Status.ToString(),

            Message = googleUser is not null
                ? "Trainer registration submitted successfully."
                : "Trainer registration submitted successfully. Please verify your email using the OTP.",

            TrainerApplicationId = trainerApplication.Id,
            ProfileImageUrl = profileImageUrl
        };
    }

    // =========================================================
    // LOGIN
    // =========================================================

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _db.Users
            .FirstOrDefaultAsync(x => x.Email == email);

        if (user is null)
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        var passwordValid = _passwordService.VerifyPassword(
            request.Password,
            user.PasswordHash);

        if (!passwordValid)
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        // =====================================================
        // EMAIL VERIFICATION
        // =====================================================

        if (!user.IsEmailVerified)
        {
            throw new UnauthorizedAccessException(
                "Please verify your email address before logging in.");
        }

        // =====================================================
        // JWT
        // =====================================================

        var jwt = _jwtService.GenerateToken(user);

        return new LoginResponse
        {
            Token = jwt.Token,
            ExpiresAt = jwt.ExpiresAt,

            User = new UserLoginDto
            {
                Id = user.Id,
                UserCode = user.UserCode,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString(),
                Status = user.Status.ToString()
            }
        };
    }

    // =========================================================
    // FORGOT PASSWORD
    // =========================================================

    public async Task<OtpResponse> ForgotPasswordAsync(
        ForgotPasswordRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        return await _otpService.SendPasswordResetOtpAsync(
            new SendOtpRequest
            {
                Email = email
            });
    }

    // =========================================================
    // VERIFY PASSWORD RESET OTP
    // =========================================================

    public async Task<OtpResponse> VerifyPasswordResetOtpAsync(
        VerifyResetOtpRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        return await _otpService.VerifyPasswordResetOtpAsync(
            new VerifyOtpRequest
            {
                Email = email,
                OtpCode = request.OtpCode
            });
    }

    // =========================================================
    // RESET PASSWORD
    // =========================================================

    public async Task<OtpResponse> ResetPasswordAsync(
        ResetPasswordRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        var user = await _db.Users
            .FirstOrDefaultAsync(x => x.Email == email);

        if (user is null)
        {
            return new OtpResponse
            {
                Success = false,
                Message = "Unable to reset password."
            };
        }

        var otp = await _db.OtpVerifications
            .Where(x =>
                x.UserId == user.Id &&
                x.Purpose == OtpPurpose.PasswordReset &&
                x.OtpCode == request.OtpCode &&
                x.IsUsed)
            .OrderByDescending(x => x.VerifiedAt)
            .FirstOrDefaultAsync();

        if (otp is null)
        {
            return new OtpResponse
            {
                Success = false,
                Message = "Invalid or unverified password reset OTP."
            };
        }

        if (otp.ExpiresAt <= DateTime.UtcNow)
        {
            return new OtpResponse
            {
                Success = false,
                Message = "The password reset OTP has expired."
            };
        }

        user.PasswordHash = _passwordService.HashPassword(
            request.NewPassword);

        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return new OtpResponse
        {
            Success = true,
            Message = "Password reset successfully."
        };
    }

    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    public async Task<OtpResponse> ChangePasswordAsync(
        Guid userId,
        ChangePasswordRequest request)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(x => x.Id == userId);

        if (user is null)
        {
            return new OtpResponse
            {
                Success = false,
                Message = "User account not found."
            };
        }

        var currentPasswordValid = _passwordService.VerifyPassword(
            request.CurrentPassword,
            user.PasswordHash);

        if (!currentPasswordValid)
        {
            return new OtpResponse
            {
                Success = false,
                Message = "Current password is incorrect."
            };
        }

        var samePassword = _passwordService.VerifyPassword(
            request.NewPassword,
            user.PasswordHash);

        if (samePassword)
        {
            return new OtpResponse
            {
                Success = false,
                Message = "New password must be different from your current password."
            };
        }

        user.PasswordHash = _passwordService.HashPassword(
            request.NewPassword);

        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return new OtpResponse
        {
            Success = true,
            Message = "Password changed successfully."
        };
    }

    // =========================================================
    // GENERATE PARTICIPANT USER CODE
    // =========================================================

    private async Task<string> GenerateParticipantUserCodeAsync()
    {
        var currentYear = DateTime.UtcNow.Year;
        var yearCode = (currentYear % 100).ToString("D2");
        var prefix = $"PTC-{yearCode}-";

        var lastUserCode = await _db.Users
            .Where(x => x.UserCode.StartsWith(prefix))
            .OrderByDescending(x => x.UserCode)
            .Select(x => x.UserCode)
            .FirstOrDefaultAsync();

        var nextNumber = 1;

        if (!string.IsNullOrWhiteSpace(lastUserCode))
        {
            var numberPart = lastUserCode.Replace(prefix, "");

            if (int.TryParse(numberPart, out var currentNumber))
            {
                nextNumber = currentNumber + 1;
            }
        }

        return $"{prefix}{nextNumber:D4}";
    }

    // =========================================================
    // GENERATE TRAINER USER CODE
    // =========================================================

    private async Task<string> GenerateTrainerUserCodeAsync()
    {
        var currentYear = DateTime.UtcNow.Year;
        var yearCode = (currentYear % 100).ToString("D2");
        var prefix = $"TRN-{yearCode}-";

        var lastUserCode = await _db.Users
            .Where(x => x.UserCode.StartsWith(prefix))
            .OrderByDescending(x => x.UserCode)
            .Select(x => x.UserCode)
            .FirstOrDefaultAsync();

        var nextNumber = 1;

        if (!string.IsNullOrWhiteSpace(lastUserCode))
        {
            var numberPart = lastUserCode.Replace(prefix, "");

            if (int.TryParse(numberPart, out var currentNumber))
            {
                nextNumber = currentNumber + 1;
            }
        }

        return $"{prefix}{nextNumber:D4}";
    }

    // =========================================================
    // BUILD FULL NAME
    // =========================================================

    private static string BuildFullName(
        string firstName,
        string? middleName,
        string lastName)
    {
        var parts = new[]
            {
                firstName,
                middleName,
                lastName
            }
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!.Trim());

        return string.Join(" ", parts);
    }

    // =========================================================
    // CLEAN STRING
    // =========================================================

    private static string? CleanString(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return value.Trim();
    }

    // =========================================================
    // EXTRACT GOOGLE PROFILE IMAGE
    // =========================================================

    private static string? ExtractGoogleProfileImage(
        string? idToken)
    {
        if (string.IsNullOrWhiteSpace(idToken))
        {
            return null;
        }

        try
        {
            var handler = new JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(idToken);

            var picture = token.Claims
                .FirstOrDefault(x => x.Type == "picture")
                ?.Value;

            var cleanedPicture = CleanString(picture);

            Console.WriteLine(
                $"GOOGLE TOKEN PICTURE CLAIM: {cleanedPicture}");

            return cleanedPicture;
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Unable to extract Google picture claim: {ex.Message}");

            return null;
        }
    }

    // =========================================================
    // VALIDATE PROFILE IMAGE
    // =========================================================

    private static void ValidateProfileImage(IFormFile file)
    {
        const long maxFileSize = 5 * 1024 * 1024;

        if (file.Length <= 0)
        {
            throw new InvalidOperationException(
                "Profile image is empty.");
        }

        if (file.Length > maxFileSize)
        {
            throw new InvalidOperationException(
                "Profile image must not exceed 5 MB.");
        }

        var allowedContentTypes = new[]
        {
            "image/jpeg",
            "image/png",
            "image/webp"
        };

        if (string.IsNullOrWhiteSpace(file.ContentType) ||
            !allowedContentTypes.Contains(
                file.ContentType.ToLowerInvariant()))
        {
            throw new InvalidOperationException(
                "Only JPG, PNG, and WEBP images are allowed.");
        }
    }

    // =========================================================
    // VALIDATE VALID ID IMAGE
    // =========================================================

    private static void ValidateValidIdImage(IFormFile file)
    {
        const long maxFileSize = 5 * 1024 * 1024;

        if (file.Length <= 0)
        {
            throw new InvalidOperationException(
                "The valid ID image is empty.");
        }

        if (file.Length > maxFileSize)
        {
            throw new InvalidOperationException(
                "The valid ID image must not exceed 5 MB.");
        }

        var allowedContentTypes = new[]
        {
            "image/jpeg",
            "image/png",
            "image/webp"
        };

        if (string.IsNullOrWhiteSpace(file.ContentType) ||
            !allowedContentTypes.Contains(
                file.ContentType.ToLowerInvariant()))
        {
            throw new InvalidOperationException(
                "Only JPG, PNG, and WEBP valid ID images are allowed.");
        }
    }
}
