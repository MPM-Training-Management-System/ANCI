using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Participant;
using server.Models.Participant;
using server.Services.Interfaces;

namespace server.Services;

public class ParticipantProfileService
    : IParticipantProfileService
{
    private readonly ApplicationDbContext _db;
    private readonly ICloudinaryService _cloudinaryService;

    public ParticipantProfileService(
        ApplicationDbContext db,
        ICloudinaryService cloudinaryService)
    {
        _db = db;
        _cloudinaryService = cloudinaryService;
    }


    // =========================================================
    // GET MY PROFILE
    // GET /api/participant-profiles/me
    // =========================================================

    public async Task<ParticipantProfileDto?>
        GetMyProfileAsync(
            Guid userId)
    {
        var profile =
            await _db.ParticipantProfiles
                .AsNoTracking()
                .Include(x => x.User)
                .FirstOrDefaultAsync(
                    x => x.UserId == userId
                );

        if (profile is null)
        {
            return null;
        }

        return MapToDto(profile);
    }


    // =========================================================
    // UPDATE MY PROFILE
    // PUT /api/participant-profiles/me
    // =========================================================

    public async Task<ParticipantProfileDto?>
    UpdateMyProfileAsync(
        Guid userId,
        UpdateParticipantProfileRequest request)
{
    var profile =
        await _db.ParticipantProfiles
            .Include(x => x.User)
            .FirstOrDefaultAsync(
                x => x.UserId == userId
            );

    if (profile is null)
    {
        return null;
    }


    // =====================================================
    // FIRST NAME
    // =====================================================

    var firstName =
        request.FirstName?.Trim();

    if (string.IsNullOrWhiteSpace(firstName))
    {
        throw new InvalidOperationException(
            "First name is required."
        );
    }

    if (firstName.Length < 2)
    {
        throw new InvalidOperationException(
            "First name must contain at least 2 characters."
        );
    }


    // =====================================================
    // LAST NAME
    // =====================================================

    var lastName =
        request.LastName?.Trim();

    if (string.IsNullOrWhiteSpace(lastName))
    {
        throw new InvalidOperationException(
            "Last name is required."
        );
    }

    if (lastName.Length < 2)
    {
        throw new InvalidOperationException(
            "Last name must contain at least 2 characters."
        );
    }


    // =====================================================
    // MIDDLE NAME
    // =====================================================

    var middleName =
        CleanString(request.MiddleName);

    if (
        middleName is not null &&
        middleName.Length > 100
    )
    {
        throw new InvalidOperationException(
            "Middle name must not exceed 100 characters."
        );
    }


    // =====================================================
    // BIRTH DATE
    // =====================================================

    if (request.BirthDate.HasValue)
    {
        var birthDate =
            request.BirthDate.Value;

        var today =
            DateOnly.FromDateTime(
                DateTime.UtcNow
            );

        if (birthDate > today)
        {
            throw new InvalidOperationException(
                "Birth date cannot be in the future."
            );
        }
    }


    // =====================================================
    // ADDRESS
    // =====================================================

    var address =
        CleanString(request.Address);

    if (
        address is not null &&
        address.Length > 500
    )
    {
        throw new InvalidOperationException(
            "Address must not exceed 500 characters."
        );
    }


    // =====================================================
    // GENDER
    // =====================================================

    var gender =
        CleanString(request.Gender);

    if (
        gender is not null
        &&
        !new[]
        {
            "Male",
            "Female",
            "Other"
        }.Contains(
            gender,
            StringComparer.OrdinalIgnoreCase
        )
    )
    {
        throw new InvalidOperationException(
            "Gender must be Male, Female, or Other."
        );
    }


    // =====================================================
    // MOBILE NUMBER
    // =====================================================

    var mobileNumber =
        CleanString(
            request.MobileNumber
        );

    if (mobileNumber is not null)
    {
        var digitsOnly =
            new string(
                mobileNumber
                    .Where(char.IsDigit)
                    .ToArray()
            );

        if (
            digitsOnly.Length < 10 ||
            digitsOnly.Length > 15
        )
        {
            throw new InvalidOperationException(
                "Invalid mobile number."
            );
        }
    }


    // =====================================================
    // UPDATE PROFILE
    // =====================================================

    profile.FirstName =
        firstName;

    profile.MiddleName =
        middleName;

    profile.LastName =
        lastName;

    profile.BirthDate =
        request.BirthDate;

    profile.Address =
        address;

    profile.Gender =
        gender;


    // =====================================================
    // UPDATE USER
    // =====================================================

    profile.User.MobileNumber =
        mobileNumber;

    profile.User.FullName =
        BuildFullName(
            firstName,
            middleName,
            lastName
        );

    profile.User.UpdatedAt =
        DateTime.UtcNow;


    await _db.SaveChangesAsync();


    return MapToDto(profile);
}

    // =========================================================
    // UPDATE PROFILE IMAGE
    // PUT /api/participant-profiles/me/image
    // =========================================================

    public async Task<ParticipantProfileDto?>
        UpdateProfileImageAsync(
            Guid userId,
            IFormFile profileImage)
    {
        var profile =
            await _db.ParticipantProfiles
                .Include(x => x.User)
                .FirstOrDefaultAsync(
                    x => x.UserId == userId
                );

        if (profile is null)
        {
            return null;
        }


        // =====================================================
        // VALIDATE FILE
        // =====================================================

        if (profileImage is null)
        {
            throw new InvalidOperationException(
                "Profile image is required."
            );
        }


        if (profileImage.Length <= 0)
        {
            throw new InvalidOperationException(
                "The uploaded profile image is empty."
            );
        }


        // Maximum 5 MB
        const long maxFileSize =
            5 * 1024 * 1024;


        if (
            profileImage.Length >
            maxFileSize
        )
        {
            throw new InvalidOperationException(
                "Profile image must not exceed 5 MB."
            );
        }


        // =====================================================
        // VALIDATE CONTENT TYPE
        // =====================================================

        var allowedContentTypes =
            new[]
            {
                "image/jpeg",
                "image/png",
                "image/webp"
            };


        if (
            string.IsNullOrWhiteSpace(
                profileImage.ContentType
            )
            ||
            !allowedContentTypes.Contains(
                profileImage.ContentType
                    .ToLowerInvariant()
            )
        )
        {
            throw new InvalidOperationException(
                "Only JPG, PNG, and WEBP images are allowed."
            );
        }


        // =====================================================
        // UPLOAD TO CLOUDINARY
        // =====================================================

        await using var stream =
            profileImage.OpenReadStream();


        var imageUrl =
            await _cloudinaryService
                .UploadImageAsync(
                    stream,
                    profileImage.FileName,
                    "ace-nextgen/participants"
                );


        if (
            string.IsNullOrWhiteSpace(
                imageUrl
            )
        )
        {
            throw new InvalidOperationException(
                "Profile image upload failed."
            );
        }


        // =====================================================
        // SAVE CLOUDINARY URL
        // =====================================================

        profile.ProfileImageUrl =
            imageUrl;


        profile.User.UpdatedAt =
            DateTime.UtcNow;


        await _db.SaveChangesAsync();


        return MapToDto(profile);
    }


    // =========================================================
    // MAP PROFILE → DTO
    // =========================================================

    private static ParticipantProfileDto
        MapToDto(
            ParticipantProfile profile)
    {
        return new ParticipantProfileDto(
            profile.Id,

            profile.UserId,

            profile.User.UserCode,

            profile.User.FullName,

            profile.User.Email,

            profile.User.MobileNumber,

            profile.FirstName,

            profile.MiddleName,

            profile.LastName,

            profile.BirthDate,

            profile.Address,

            profile.Gender,

            profile.ProfileImageUrl,

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
    
}