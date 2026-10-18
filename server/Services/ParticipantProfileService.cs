
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Participant;
using server.Interfaces;
using server.Models.Participant;
using server.Services.Interfaces;

namespace server.Services;

public class ParticipantProfileService : IParticipantProfileService
{
    private readonly ApplicationDbContext _db;
    private readonly ICloudinaryService _cloudinaryService;
    private readonly ICacheService _cacheService;

    private const long MaxImageSize = 5 * 1024 * 1024;

    private static readonly string[] AllowedImageTypes =
    [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    private static string GetProfileCacheKey(Guid userId)
        => $"participant:profile:{userId}";

    public ParticipantProfileService(
        ApplicationDbContext db,
        ICloudinaryService cloudinaryService,
        ICacheService cacheService)
    {
        _db = db;
        _cloudinaryService = cloudinaryService;
        _cacheService = cacheService;
    }

    // =========================================================
    // GET MY PROFILE
    // GET /api/participant-profiles/me
    // =========================================================

    public async Task<ParticipantProfileDto?> GetMyProfileAsync(
        Guid userId)
    {
        var cacheKey = GetProfileCacheKey(userId);

        var cachedProfile =
            _cacheService.Get<ParticipantProfileDto>(cacheKey);

        if (cachedProfile is not null)
            return cachedProfile;

        var profile = await _db.ParticipantProfiles
            .AsNoTracking()
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (profile is null)
            return null;

        var result = MapToDto(profile);

        _cacheService.Set(
            cacheKey,
            result,
            TimeSpan.FromMinutes(5));

        return result;
    }

    // =========================================================
    // UPDATE MY PROFILE
    // PUT /api/participant-profiles/me
    // =========================================================

    public async Task<ParticipantProfileDto?> UpdateMyProfileAsync(
        Guid userId,
        UpdateParticipantProfileRequest request)
    {
        var profile = await _db.ParticipantProfiles
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (profile is null)
            return null;

        // Personal information
        var firstName = CleanString(request.FirstName);
        var middleName = CleanString(request.MiddleName);
        var lastName = CleanString(request.LastName);

        if (string.IsNullOrWhiteSpace(firstName) ||
            firstName.Length < 2)
        {
            throw new InvalidOperationException(
                "First name must contain at least 2 characters.");
        }

        if (string.IsNullOrWhiteSpace(lastName) ||
            lastName.Length < 2)
        {
            throw new InvalidOperationException(
                "Last name must contain at least 2 characters.");
        }

        if (middleName?.Length > 100)
        {
            throw new InvalidOperationException(
                "Middle name must not exceed 100 characters.");
        }

        if (request.BirthDate.HasValue)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            if (request.BirthDate.Value > today)
            {
                throw new InvalidOperationException(
                    "Birth date cannot be in the future.");
            }
        }

        var address = CleanString(request.Address);
        var gender = CleanString(request.Gender);
        var mobileNumber = CleanString(request.MobileNumber);

        if (address?.Length > 500)
        {
            throw new InvalidOperationException(
                "Address must not exceed 500 characters.");
        }

        if (gender is not null &&
            !new[] { "Male", "Female", "Other" }.Contains(
                gender,
                StringComparer.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "Gender must be Male, Female, or Other.");
        }

        if (mobileNumber is not null)
        {
            var digitsOnly = new string(
                mobileNumber.Where(char.IsDigit).ToArray());

            if (digitsOnly.Length < 10 ||
                digitsOnly.Length > 15)
            {
                throw new InvalidOperationException(
                    "Invalid mobile number.");
            }
        }

        // Educational background
        var educationalAttainment =
            CleanString(request.HighestEducationalAttainment);

        var educationalStatus =
            CleanString(request.EducationalStatus);

        var schoolName = CleanString(request.SchoolName);
        var courseOrDegree = CleanString(request.CourseOrDegree);
        var fieldOfStudy = CleanString(request.FieldOfStudy);

        if (request.YearGraduated.HasValue)
        {
            var currentYear = DateTime.UtcNow.Year;

            if (request.YearGraduated.Value < 1900 ||
                request.YearGraduated.Value > currentYear)
            {
                throw new InvalidOperationException(
                    "Invalid graduation year.");
            }
        }

        // Employment information
        var employmentStatus =
            CleanString(request.EmploymentStatus);

        var companyName = CleanString(request.CompanyName);
        var jobTitle = CleanString(request.JobTitle);
        var industry = CleanString(request.Industry);

        if (request.YearsOfWorkExperience is < 0 or > 80)
        {
            throw new InvalidOperationException(
                "Years of work experience must be between 0 and 80.");
        }

        // Emergency contact
        var emergencyContactName =
            CleanString(request.EmergencyContactName);

        var emergencyContactNumber =
            CleanString(request.EmergencyContactNumber);

        var emergencyContactRelationship =
            CleanString(request.EmergencyContactRelationship);

        if (emergencyContactNumber is not null)
        {
            var digitsOnly = new string(
                emergencyContactNumber
                    .Where(char.IsDigit)
                    .ToArray());

            if (digitsOnly.Length < 10 ||
                digitsOnly.Length > 15)
            {
                throw new InvalidOperationException(
                    "Invalid emergency contact number.");
            }
        }

        // Save personal information
        profile.FirstName = firstName;
        profile.MiddleName = middleName;
        profile.LastName = lastName;
        profile.BirthDate = request.BirthDate;
        profile.Address = address;
        profile.Gender = gender;

        // Save educational background
        profile.HighestEducationalAttainment =
            educationalAttainment;

        profile.EducationalStatus = educationalStatus;
        profile.SchoolName = schoolName;
        profile.CourseOrDegree = courseOrDegree;
        profile.FieldOfStudy = fieldOfStudy;
        profile.YearGraduated = request.YearGraduated;

        // Save employment information
        profile.EmploymentStatus = employmentStatus;
        profile.CompanyName = companyName;
        profile.JobTitle = jobTitle;
        profile.Industry = industry;
        profile.YearsOfWorkExperience =
            request.YearsOfWorkExperience;

        // Save emergency contact
        profile.EmergencyContactName = emergencyContactName;
        profile.EmergencyContactNumber = emergencyContactNumber;
        profile.EmergencyContactRelationship =
            emergencyContactRelationship;

        // Update associated user
        profile.User.MobileNumber = mobileNumber;

        profile.User.FullName = BuildFullName(
            firstName,
            middleName,
            lastName);

        profile.User.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var result = MapToDto(profile);

        _cacheService.Set(
            GetProfileCacheKey(userId),
            result,
            TimeSpan.FromMinutes(5));

        return result;
    }

    // =========================================================
    // UPDATE PROFILE IMAGE
    // PUT /api/participant-profiles/me/image
    // =========================================================

    public async Task<ParticipantProfileDto?> UpdateProfileImageAsync(
        Guid userId,
        IFormFile profileImage)
    {
        var profile = await _db.ParticipantProfiles
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (profile is null)
            return null;

        ValidateImage(profileImage, "Profile image");

        await using var stream = profileImage.OpenReadStream();

        var imageUrl = await _cloudinaryService.UploadImageAsync(
            stream,
            Path.GetFileName(profileImage.FileName),
            "ace-nextgen/participants");

        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            throw new InvalidOperationException(
                "Profile image upload failed.");
        }

        profile.ProfileImageUrl = imageUrl;
        profile.User.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var result = MapToDto(profile);

        _cacheService.Set(
            GetProfileCacheKey(userId),
            result,
            TimeSpan.FromMinutes(5));

        return result;
    }

    // =========================================================
    // UPLOAD VALID ID
    // PUT /api/participant-profiles/me/valid-id
    // =========================================================

    public async Task<ParticipantProfileDto?> UpdateValidIdAsync(
        Guid userId,
        IFormFile validIdImage,
        string validIdType,
        string? validIdNumber)
    {
        var profile = await _db.ParticipantProfiles
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (profile is null)
            return null;

        ValidateImage(validIdImage, "Valid ID image");

        validIdType = validIdType?.Trim() ?? string.Empty;
        validIdNumber = CleanString(validIdNumber);

        if (string.IsNullOrWhiteSpace(validIdType) ||
            validIdType.Length > 100)
        {
            throw new InvalidOperationException(
                "A valid ID type is required and must not exceed 100 characters.");
        }

        if (validIdNumber?.Length > 100)
        {
            throw new InvalidOperationException(
                "ID number must not exceed 100 characters.");
        }

        // Upload ID separately from the profile image.
        await using var stream = validIdImage.OpenReadStream();

        var imageUrl = await _cloudinaryService.UploadImageAsync(
            stream,
            Path.GetFileName(validIdImage.FileName),
            "ace-nextgen/participants/valid-ids");

        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            throw new InvalidOperationException(
                "Valid ID upload failed.");
        }

        profile.ValidIdType = validIdType;
        profile.ValidIdNumber = validIdNumber;
        profile.ValidIdImageUrl = imageUrl;

        // A newly uploaded or replaced ID must be reviewed again.
        profile.ValidIdVerificationStatus = "Pending";
        profile.ValidIdRemarks = null;
        profile.ValidIdVerifiedAt = null;
        profile.ValidIdVerifiedBy = null;

        profile.User.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var result = MapToDto(profile);

        _cacheService.Set(
            GetProfileCacheKey(userId),
            result,
            TimeSpan.FromMinutes(5));

        return result;
    }

    // =========================================================
    // VALIDATE IMAGE
    // =========================================================

    private static void ValidateImage(
        IFormFile image,
        string fieldName)
    {
        if (image is null)
        {
            throw new InvalidOperationException(
                $"{fieldName} is required.");
        }

        if (image.Length <= 0)
        {
            throw new InvalidOperationException(
                $"{fieldName} is empty.");
        }

        if (image.Length > MaxImageSize)
        {
            throw new InvalidOperationException(
                $"{fieldName} must not exceed 5 MB.");
        }

        var contentType = image.ContentType?.ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(contentType) ||
            !AllowedImageTypes.Contains(contentType))
        {
            throw new InvalidOperationException(
                $"Only JPG, PNG, and WEBP {fieldName.ToLowerInvariant()} files are allowed.");
        }
    }

    // =========================================================
    // MAP PROFILE TO DTO
    // =========================================================

    private static ParticipantProfileDto MapToDto(
        ParticipantProfile profile)
    {
        return new ParticipantProfileDto(
            profile.Id,
            profile.UserId,
            profile.User.UserCode,
            profile.User.FullName,
            profile.User.Email,
            profile.User.MobileNumber,

            // Personal information
            profile.FirstName,
            profile.MiddleName,
            profile.LastName,
            profile.BirthDate,
            profile.Address,
            profile.Gender,
            profile.ProfileImageUrl,

            // Educational background
            profile.HighestEducationalAttainment,
            profile.EducationalStatus,
            profile.SchoolName,
            profile.CourseOrDegree,
            profile.FieldOfStudy,
            profile.YearGraduated,

            // Employment information
            profile.EmploymentStatus,
            profile.CompanyName,
            profile.JobTitle,
            profile.Industry,
            profile.YearsOfWorkExperience,

            // Valid ID
            profile.ValidIdType,
            profile.ValidIdNumber,
            profile.ValidIdImageUrl,
            profile.ValidIdVerificationStatus,
            profile.ValidIdRemarks,
            profile.ValidIdVerifiedAt,

            // Emergency contact
            profile.EmergencyContactName,
            profile.EmergencyContactNumber,
            profile.EmergencyContactRelationship,

            // Account information
            profile.User.Role.ToString(),
            profile.User.Status.ToString()
        );
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
    // CLEAN OPTIONAL STRING
    // =========================================================

    private static string? CleanString(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}
