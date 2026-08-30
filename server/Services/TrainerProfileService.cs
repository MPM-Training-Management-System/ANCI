using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Trainer;
using server.Enums;
using server.Services.Interfaces;

namespace server.Services;

public class TrainerProfileService
    : ITrainerProfileService
{
    private readonly ApplicationDbContext _db;


    public TrainerProfileService(
        ApplicationDbContext db)
    {
        _db = db;
    }


    // =========================================================
    // GET MY PROFILE
    // =========================================================

    public async Task<TrainerProfileDto?>
        GetMyProfileAsync(
            Guid userId)
    {
        return await _db.TrainerProfiles
            .AsNoTracking()
            .Where(
                x =>
                    x.UserId == userId
            )
            .Select(
                x =>
                    new TrainerProfileDto(
                        x.Id,

                        x.UserId,

                        x.User.UserCode,

                        x.User.FullName,

                        x.User.Email,

                        x.User.MobileNumber,

                        x.FirstName,

                        x.MiddleName,

                        x.LastName,

                        x.BirthDate,

                        x.Address,

                        x.Gender,

                        x.IsActive,

                        x.Specialization,

                        x.Bio,

                        x.YearsOfExperience,

                        x.ProfileImageUrl,

                        x.ActivatedAt
                    )
            )
            .FirstOrDefaultAsync();
    }


    // =========================================================
    // UPDATE MY PROFILE
    // =========================================================

    public async Task<TrainerProfileDto?>
        UpdateMyProfileAsync(
            Guid userId,
            UpdateTrainerProfileRequest request)
    {
        var profile =
            await _db.TrainerProfiles
                .Include(
                    x => x.User
                )
                .FirstOrDefaultAsync(
                    x =>
                        x.UserId == userId
                );


        if (profile is null)
        {
            return null;
        }


        // =====================================================
        // FIRST NAME
        // =====================================================

        if (
            request.FirstName is not null
        )
        {
            profile.FirstName =
                CleanString(
                    request.FirstName
                );
        }


        // =====================================================
        // MIDDLE NAME
        // =====================================================

        if (
            request.MiddleName is not null
        )
        {
            profile.MiddleName =
                CleanString(
                    request.MiddleName
                );
        }


        // =====================================================
        // LAST NAME
        // =====================================================

        if (
            request.LastName is not null
        )
        {
            profile.LastName =
                CleanString(
                    request.LastName
                );
        }


        // =====================================================
        // BIRTH DATE
        // =====================================================

        if (
            request.BirthDate.HasValue
        )
        {
            profile.BirthDate =
                request.BirthDate;
        }


        // =====================================================
        // ADDRESS
        // =====================================================

        if (
            request.Address is not null
        )
        {
            profile.Address =
                CleanString(
                    request.Address
                );
        }


        // =====================================================
        // GENDER
        // =====================================================

        if (
            request.Gender is not null
        )
        {
            profile.Gender =
                CleanString(
                    request.Gender
                );
        }


        // =====================================================
        // MOBILE NUMBER
        // =====================================================

        if (
            request.MobileNumber is not null
        )
        {
            profile.User.MobileNumber =
                CleanString(
                    request.MobileNumber
                );
        }


        // =====================================================
        // SPECIALIZATION
        // =====================================================

        if (
            request.Specialization is not null
        )
        {
            var specialization =
                request.Specialization.Trim();


            if (
                string.IsNullOrWhiteSpace(
                    specialization
                )
            )
            {
                throw new InvalidOperationException(
                    "Specialization cannot be empty."
                );
            }


            profile.Specialization =
                specialization;
        }


        // =====================================================
        // BIO
        // =====================================================

        if (
            request.Bio is not null
        )
        {
            profile.Bio =
                CleanString(
                    request.Bio
                );
        }


        // =====================================================
        // YEARS OF EXPERIENCE
        // =====================================================

        if (
            request.YearsOfExperience.HasValue
        )
        {
            if (
                request.YearsOfExperience.Value < 0
                ||
                request.YearsOfExperience.Value > 100
            )
            {
                throw new InvalidOperationException(
                    "Years of experience must be between 0 and 100."
                );
            }


            profile.YearsOfExperience =
                request.YearsOfExperience;
        }


        // =====================================================
        // REBUILD FULL NAME
        // =====================================================

        var nameParts =
            new[]
            {
                profile.FirstName,
                profile.MiddleName,
                profile.LastName
            }
            .Where(
                x =>
                    !string.IsNullOrWhiteSpace(x)
            )
            .Select(
                x =>
                    x!.Trim()
            );


        profile.User.FullName =
            string.Join(
                " ",
                nameParts
            );


        // =====================================================
        // UPDATED AT
        // =====================================================

        profile.User.UpdatedAt =
            DateTime.UtcNow;


        // =====================================================
        // SAVE
        // =====================================================

        await _db.SaveChangesAsync();


        // =====================================================
        // RETURN UPDATED PROFILE
        // =====================================================

        return await GetMyProfileAsync(
            userId
        );
    }


    // =========================================================
    // GET PROFILE BY ID
    // ADMIN
    // =========================================================

    public async Task<TrainerProfileDto?>
        GetByIdAsync(
            Guid id)
    {
        return await _db.TrainerProfiles
            .AsNoTracking()
            .Where(
                x =>
                    x.Id == id
                    &&
                    x.IsActive
            )
            .Select(
                x =>
                    new TrainerProfileDto(
                        x.Id,

                        x.UserId,

                        x.User.UserCode,

                        x.User.FullName,

                        x.User.Email,

                        x.User.MobileNumber,

                        x.FirstName,

                        x.MiddleName,

                        x.LastName,

                        x.BirthDate,

                        x.Address,

                        x.Gender,

                        x.IsActive,

                        x.Specialization,

                        x.Bio,

                        x.YearsOfExperience,

                        x.ProfileImageUrl,

                        x.ActivatedAt
                    )
            )
            .FirstOrDefaultAsync();
    }


    // =========================================================
    // GET ACTIVE TRAINERS
    // ADMIN
    // =========================================================

    public async Task<List<TrainerProfileDto>>
        GetActiveTrainersAsync()
    {
        return await _db.TrainerProfiles
            .AsNoTracking()
            .Where(
                x =>
                    x.IsActive
                    &&
                    x.User.Status ==
                        UserStatus.Active
            )
            .OrderBy(
                x =>
                    x.User.FullName
            )
            .Select(
                x =>
                    new TrainerProfileDto(
                        x.Id,

                        x.UserId,

                        x.User.UserCode,

                        x.User.FullName,

                        x.User.Email,

                        x.User.MobileNumber,

                        x.FirstName,

                        x.MiddleName,

                        x.LastName,

                        x.BirthDate,

                        x.Address,

                        x.Gender,

                        x.IsActive,

                        x.Specialization,

                        x.Bio,

                        x.YearsOfExperience,

                        x.ProfileImageUrl,

                        x.ActivatedAt
                    )
            )
            .ToListAsync();
    }


    // =========================================================
    // CLEAN STRING
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