using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Admin;
using server.Enums;
using server.Services.Interfaces;

namespace server.Services;

public class AdminUserService : IAdminUserService
{
    private readonly ApplicationDbContext _db;

    public AdminUserService(
        ApplicationDbContext db
    )
    {
        _db = db;
    }


    // =========================================================
    // GET ALL USERS
    // =========================================================

    public async Task<List<AdminUserListDto>>
        GetUsersAsync()
    {
        var users =
            await _db.Users
                .Include(x => x.ParticipantProfile)
                .Include(x => x.TrainerProfile)
                .Where(x =>
                    x.Role == UserRole.Participant ||
                    x.Role == UserRole.Trainer
                )
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

        return users
            .Select(MapToListDto)
            .ToList();
    }


    // =========================================================
    // GET USER BY ID
    // =========================================================

    public async Task<AdminUserDetailsDto?>
        GetUserByIdAsync(
            Guid id
        )
    {
        var user =
            await _db.Users
                .Include(x => x.ParticipantProfile)
                .Include(x => x.TrainerProfile)
                .FirstOrDefaultAsync(
                    x => x.Id == id
                );

        if (user is null)
            return null;

        // Admin User Management should only
        // manage Participants and Trainers.
        if (
            user.Role != UserRole.Participant &&
            user.Role != UserRole.Trainer
        )
        {
            return null;
        }

        return MapToDetailsDto(user);
    }


    // =========================================================
    // UPDATE USER
    // =========================================================

    public async Task<AdminUserDetailsDto?>
        UpdateUserAsync(
            Guid id,
            UpdateAdminUserRequest request
        )
    {
        var user =
            await _db.Users
                .Include(x => x.ParticipantProfile)
                .Include(x => x.TrainerProfile)
                .FirstOrDefaultAsync(
                    x => x.Id == id
                );

        if (user is null)
            return null;

        if (
            user.Role != UserRole.Participant &&
            user.Role != UserRole.Trainer
        )
        {
            return null;
        }


        // =====================================================
        // VALIDATE EMAIL
        // =====================================================

        if (
            !string.IsNullOrWhiteSpace(request.Email)
        )
        {
            var email =
                request.Email
                    .Trim()
                    .ToLowerInvariant();

            var emailExists =
                await _db.Users.AnyAsync(
                    x =>
                        x.Id != id &&
                        x.Email == email
                );

            if (emailExists)
            {
                throw new InvalidOperationException(
                    "An account with this email already exists."
                );
            }

            user.Email = email;
        }


        // =====================================================
        // COMMON USER INFORMATION
        // =====================================================

        if (
            request.FullName is not null
        )
        {
            if (
                string.IsNullOrWhiteSpace(
                    request.FullName
                )
            )
            {
                throw new InvalidOperationException(
                    "Full name cannot be empty."
                );
            }

            user.FullName =
                request.FullName.Trim();
        }


        if (
            request.MobileNumber is not null
        )
        {
            user.MobileNumber =
                CleanString(
                    request.MobileNumber
                );
        }


        // =====================================================
        // PARTICIPANT
        // =====================================================

        if (
            user.Role == UserRole.Participant
        )
        {
            if (
                user.ParticipantProfile is null
            )
            {
                throw new InvalidOperationException(
                    "Participant profile was not found."
                );
            }

            var profile =
                user.ParticipantProfile;

            UpdatePersonalInformation(
                profile,
                request
            );

            // Keep User.FullName synchronized
            user.FullName =
                BuildFullName(
                    profile.FirstName,
                    profile.MiddleName,
                    profile.LastName
                );
        }


        // =====================================================
        // TRAINER
        // =====================================================

        if (
            user.Role == UserRole.Trainer
        )
        {
            if (
                user.TrainerProfile is null
            )
            {
                throw new InvalidOperationException(
                    "Trainer profile was not found."
                );
            }

            var profile =
                user.TrainerProfile;

            UpdateTrainerInformation(
                profile,
                request
            );

            // Keep User.FullName synchronized
            user.FullName =
                BuildFullName(
                    profile.FirstName,
                    profile.MiddleName,
                    profile.LastName
                );
        }


        user.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToDetailsDto(user);
    }


    // =========================================================
    // UPDATE USER STATUS
    // =========================================================

    public async Task<AdminUserDetailsDto?>
        UpdateUserStatusAsync(
            Guid id,
            UpdateAdminUserStatusRequest request
        )
    {
        var user =
            await _db.Users
                .Include(x => x.ParticipantProfile)
                .Include(x => x.TrainerProfile)
                .FirstOrDefaultAsync(
                    x => x.Id == id
                );

        if (user is null)
            return null;

        if (
            user.Role != UserRole.Participant &&
            user.Role != UserRole.Trainer
        )
        {
            return null;
        }


        user.Status =
            request.Status;

        user.UpdatedAt =
            DateTime.UtcNow;


        // =====================================================
        // TRAINER ACTIVATION
        // =====================================================

        if (
            user.Role == UserRole.Trainer &&
            user.TrainerProfile is not null
        )
        {
            if (
                request.Status == UserStatus.Active
            )
            {
                user.TrainerProfile.IsActive =
                    true;

                user.TrainerProfile.ActivatedAt =
                    user.TrainerProfile.ActivatedAt
                    ?? DateTime.UtcNow;
            }
            else
            {
                user.TrainerProfile.IsActive =
                    false;
            }
        }


        await _db.SaveChangesAsync();

        return MapToDetailsDto(user);
    }


    // =========================================================
    // DELETE USER
    // =========================================================

    public async Task<bool>
        DeleteUserAsync(
            Guid id
        )
    {
        var user =
            await _db.Users
                .FirstOrDefaultAsync(
                    x => x.Id == id
                );

        if (user is null)
            return false;

        if (
            user.Role != UserRole.Participant &&
            user.Role != UserRole.Trainer
        )
        {
            throw new InvalidOperationException(
                "Admin accounts cannot be deleted from User Management."
            );
        }

        _db.Users.Remove(user);

        await _db.SaveChangesAsync();

        return true;
    }


    // =========================================================
    // PARTICIPANT UPDATE
    // =========================================================

    private static void UpdatePersonalInformation(
        Models.Participant.ParticipantProfile profile,
        UpdateAdminUserRequest request
    )
    {
        if (request.FirstName is not null)
        {
            profile.FirstName =
                CleanString(request.FirstName);
        }

        if (request.MiddleName is not null)
        {
            profile.MiddleName =
                CleanString(request.MiddleName);
        }

        if (request.LastName is not null)
        {
            profile.LastName =
                CleanString(request.LastName);
        }

        if (request.BirthDate.HasValue)
        {
            profile.BirthDate =
                request.BirthDate;
        }

        if (request.Address is not null)
        {
            profile.Address =
                CleanString(request.Address);
        }

        if (request.Gender is not null)
        {
            profile.Gender =
                CleanString(request.Gender);
        }
    }


    // =========================================================
    // TRAINER UPDATE
    // =========================================================

    private static void UpdateTrainerInformation(
        Models.Trainer.TrainerProfile profile,
        UpdateAdminUserRequest request
    )
    {
        if (request.FirstName is not null)
        {
            profile.FirstName =
                CleanString(request.FirstName);
        }

        if (request.MiddleName is not null)
        {
            profile.MiddleName =
                CleanString(request.MiddleName);
        }

        if (request.LastName is not null)
        {
            profile.LastName =
                CleanString(request.LastName);
        }

        if (request.BirthDate.HasValue)
        {
            profile.BirthDate =
                request.BirthDate;
        }

        if (request.Address is not null)
        {
            profile.Address =
                CleanString(request.Address);
        }

        if (request.Gender is not null)
        {
            profile.Gender =
                CleanString(request.Gender);
        }


        if (request.Specialization is not null)
        {
            if (
                string.IsNullOrWhiteSpace(
                    request.Specialization
                )
            )
            {
                throw new InvalidOperationException(
                    "Specialization cannot be empty."
                );
            }

            profile.Specialization =
                request.Specialization.Trim();
        }


        if (request.Bio is not null)
        {
            profile.Bio =
                CleanString(request.Bio);
        }


        if (request.YearsOfExperience.HasValue)
        {
            if (
                request.YearsOfExperience.Value < 0 ||
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


        if (request.IsActive.HasValue)
        {
            profile.IsActive =
                request.IsActive.Value;

            if (
                request.IsActive.Value &&
                profile.ActivatedAt is null
            )
            {
                profile.ActivatedAt =
                    DateTime.UtcNow;
            }
        }
    }


    // =========================================================
    // MAPPING
    // =========================================================

    private static AdminUserListDto
        MapToListDto(
            Models.Auth.User user
        )
    {
        return new AdminUserListDto
        {
            Id = user.Id,

            UserCode =
                user.UserCode,

            FullName =
                user.FullName,

            Email =
                user.Email,

            MobileNumber =
                user.MobileNumber,

            Role =
                user.Role,

            Status =
                user.Status,

            IsEmailVerified =
                user.IsEmailVerified,

            CreatedAt =
                user.CreatedAt,

            UpdatedAt =
                user.UpdatedAt,

            ProfileImageUrl =
                user.Role == UserRole.Participant
                    ? user.ParticipantProfile
                        ?.ProfileImageUrl
                    : user.TrainerProfile
                        ?.ProfileImageUrl
        };
    }


    private static AdminUserDetailsDto
        MapToDetailsDto(
            Models.Auth.User user
        )
    {
        return new AdminUserDetailsDto
        {
            Id =
                user.Id,

            UserCode =
                user.UserCode,

            FullName =
                user.FullName,

            Email =
                user.Email,

            MobileNumber =
                user.MobileNumber,

            Role =
                user.Role,

            Status =
                user.Status,

            IsEmailVerified =
                user.IsEmailVerified,

            CreatedAt =
                user.CreatedAt,

            UpdatedAt =
                user.UpdatedAt,

            ParticipantProfile =
                user.ParticipantProfile is null
                    ? null
                    : new AdminParticipantProfileDto
                    {
                        Id =
                            user.ParticipantProfile.Id,

                        FirstName =
                            user.ParticipantProfile.FirstName,

                        MiddleName =
                            user.ParticipantProfile.MiddleName,

                        LastName =
                            user.ParticipantProfile.LastName,

                        BirthDate =
                            user.ParticipantProfile.BirthDate,

                        Address =
                            user.ParticipantProfile.Address,

                        Gender =
                            user.ParticipantProfile.Gender,

                        ProfileImageUrl =
                            user.ParticipantProfile
                                .ProfileImageUrl
                    },

            TrainerProfile =
                user.TrainerProfile is null
                    ? null
                    : new AdminTrainerProfileDto
                    {
                        Id =
                            user.TrainerProfile.Id,

                        FirstName =
                            user.TrainerProfile.FirstName,

                        MiddleName =
                            user.TrainerProfile.MiddleName,

                        LastName =
                            user.TrainerProfile.LastName,

                        BirthDate =
                            user.TrainerProfile.BirthDate,

                        Address =
                            user.TrainerProfile.Address,

                        Gender =
                            user.TrainerProfile.Gender,

                        IsActive =
                            user.TrainerProfile.IsActive,

                        Specialization =
                            user.TrainerProfile.Specialization,

                        Bio =
                            user.TrainerProfile.Bio,

                        YearsOfExperience =
                            user.TrainerProfile.YearsOfExperience,

                        ProfileImageUrl =
                            user.TrainerProfile.ProfileImageUrl,

                        ActivatedAt =
                            user.TrainerProfile.ActivatedAt
                    }
        };
    }


    // =========================================================
    // HELPERS
    // =========================================================

    private static string? CleanString(
        string? value
    )
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }


    private static string BuildFullName(
        string? firstName,
        string? middleName,
        string? lastName
    )
    {
        return string.Join(
            " ",
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
            )
        );
    }
}