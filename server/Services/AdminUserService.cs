
using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Admin;
using server.Enums;
using server.Interfaces;
using server.Models.Auth;
using server.Models.Participant;
using server.Models.Trainer;
using server.Services.Interfaces;

namespace server.Services;

public class AdminUserService : IAdminUserService
{
   private readonly ApplicationDbContext _db;
   private readonly ILogger<AdminUserService> _logger;
private readonly ICacheService _cache;

private const string UserCachePrefix = "admin-users:";
private static readonly TimeSpan UserCacheExpiration =
    TimeSpan.FromMinutes(5);

public AdminUserService(
    ApplicationDbContext db,
    ICacheService cache,
    ILogger<AdminUserService> logger)
{
    _db = db;
    _cache = cache;
    _logger = logger;
}

   public async Task<List<AdminUserListDto>> GetUsersAsync()
{
    const string cacheKey = $"{UserCachePrefix}list";

    if (_cache.TryGet<List<AdminUserListDto>>(
            cacheKey,
            out var cachedUsers) &&
        cachedUsers is not null)
    {
        return cachedUsers;
    }

    var users = await _db.Users
        .AsNoTracking()
        .Include(x => x.ParticipantProfile)
        .Include(x => x.TrainerProfile)
        .Where(x =>
            x.Role == UserRole.Participant ||
            x.Role == UserRole.Trainer)
        .OrderByDescending(x => x.CreatedAt)
        .ToListAsync();

    var result = users.Select(MapToListDto).ToList();

    _cache.Set(
        cacheKey,
        result,
        UserCacheExpiration);

    return result;
}

  public async Task<AdminUserDetailsDto?> GetUserByIdAsync(
    Guid id)
{
    var cacheKey = $"{UserCachePrefix}details:{id}";

    if (_cache.TryGet<AdminUserDetailsDto>(
            cacheKey,
            out var cachedUser) &&
        cachedUser is not null)
    {
        return cachedUser;
    }

    var user = await _db.Users
        .AsNoTracking()
        .Include(x => x.ParticipantProfile)
        .Include(x => x.TrainerProfile)
        .FirstOrDefaultAsync(x => x.Id == id);

    if (user is null || !IsManageableRole(user.Role))
    {
        return null;
    }

    var result = MapToDetailsDto(user);

    _cache.Set(
        cacheKey,
        result,
        UserCacheExpiration);

    return result;
}


    public async Task<AdminUserDetailsDto?> UpdateUserAsync(
        Guid id,
        UpdateAdminUserRequest request)
    {
        var user = await _db.Users
            .Include(x => x.ParticipantProfile)
            .Include(x => x.TrainerProfile)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (user is null || !IsManageableRole(user.Role))
            return null;

        // EMAIL
        if (request.Email is not null)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                throw new InvalidOperationException(
                    "Email cannot be empty.");
            }

            var email = request.Email.Trim().ToLowerInvariant();

            var emailExists = await _db.Users.AnyAsync(x =>
                x.Id != id && x.Email == email);

            if (emailExists)
            {
                throw new InvalidOperationException(
                    "An account with this email already exists.");
            }

            user.Email = email;
        }

        // COMMON ACCOUNT INFORMATION
        if (request.MobileNumber is not null)
        {
            user.MobileNumber = RequiredString(
                request.MobileNumber,
                "Mobile number");
        }

        if (request.FullName is not null &&
            string.IsNullOrWhiteSpace(request.FullName))
        {
            throw new InvalidOperationException(
                "Full name cannot be empty.");
        }

        // PARTICIPANT
        if (user.Role == UserRole.Participant)
        {
            var profile = user.ParticipantProfile
                ?? throw new InvalidOperationException(
                    "Participant profile was not found.");

            UpdateParticipantInformation(profile, request);

            user.FullName = BuildFullName(
                profile.FirstName,
                profile.MiddleName,
                profile.LastName);
        }

        // TRAINER
        if (user.Role == UserRole.Trainer)
        {
            var profile = user.TrainerProfile
                ?? throw new InvalidOperationException(
                    "Trainer profile was not found.");

            UpdateTrainerInformation(profile, request);

            user.FullName = BuildFullName(
                profile.FirstName,
                profile.MiddleName,
                profile.LastName);
        }

        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToDetailsDto(user);
    }

    // =========================================================
    // UPDATE USER STATUS
    // =========================================================

    public async Task<AdminUserDetailsDto?> UpdateUserStatusAsync(
        Guid id,
        UpdateAdminUserStatusRequest request)
    {
        var user = await _db.Users
            .Include(x => x.ParticipantProfile)
            .Include(x => x.TrainerProfile)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (user is null || !IsManageableRole(user.Role))
            return null;

        user.Status = request.Status;
        user.UpdatedAt = DateTime.UtcNow;

        if (user.Role == UserRole.Trainer &&
            user.TrainerProfile is not null)
        {
            var profile = user.TrainerProfile;

            if (request.Status == UserStatus.Active)
            {
                profile.IsActive = true;
                profile.ActivatedAt ??= DateTime.UtcNow;
            }
            else
            {
                profile.IsActive = false;
            }
        }

        await _db.SaveChangesAsync();

        return MapToDetailsDto(user);
    }

    // =========================================================
    // DELETE USER
    // =========================================================

    public async Task<bool> DeleteUserAsync(Guid id)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(x => x.Id == id);

        if (user is null)
            return false;

        if (!IsManageableRole(user.Role))
        {
            throw new InvalidOperationException(
                "Admin accounts cannot be deleted from User Management.");
        }

        // Related records may restrict deletion through foreign keys.
        // Handle enrollment/history retention according to your
        // database relationships before enabling permanent deletion.
        _db.Users.Remove(user);

        await _db.SaveChangesAsync();

        return true;
    }

    // =========================================================
    // UPDATE PARTICIPANT INFORMATION
    // =========================================================

    private static void UpdateParticipantInformation(
        ParticipantProfile profile,
        UpdateAdminUserRequest request)
    {
        if (request.FirstName is not null)
            profile.FirstName = RequiredString(
                request.FirstName, "First name");

        if (request.MiddleName is not null)
            profile.MiddleName = CleanString(request.MiddleName);

        if (request.LastName is not null)
            profile.LastName = RequiredString(
                request.LastName, "Last name");

        if (request.BirthDate.HasValue)
        {
            if (request.BirthDate.Value > DateOnly.FromDateTime(
                    DateTime.UtcNow))
            {
                throw new InvalidOperationException(
                    "Birth date cannot be in the future.");
            }

            profile.BirthDate = request.BirthDate;
        }

        if (request.Address is not null)
            profile.Address = RequiredString(
                request.Address, "Address");

        if (request.Gender is not null)
            profile.Gender = CleanString(request.Gender);

        // EDUCATIONAL BACKGROUND
        if (request.HighestEducationalAttainment is not null)
            profile.HighestEducationalAttainment =
                CleanString(request.HighestEducationalAttainment);

        if (request.EducationalStatus is not null)
            profile.EducationalStatus =
                CleanString(request.EducationalStatus);

        if (request.SchoolName is not null)
            profile.SchoolName = CleanString(request.SchoolName);

        if (request.CourseOrDegree is not null)
            profile.CourseOrDegree = CleanString(request.CourseOrDegree);

        if (request.FieldOfStudy is not null)
            profile.FieldOfStudy = CleanString(request.FieldOfStudy);

        if (request.YearGraduated.HasValue)
        {
            ValidateYear(
                request.YearGraduated.Value,
                "Year graduated");

            profile.YearGraduated = request.YearGraduated;
        }

        // EMPLOYMENT INFORMATION
        if (request.EmploymentStatus is not null)
            profile.EmploymentStatus =
                CleanString(request.EmploymentStatus);

        if (request.CompanyName is not null)
            profile.CompanyName = CleanString(request.CompanyName);

        if (request.JobTitle is not null)
            profile.JobTitle = CleanString(request.JobTitle);

        if (request.Industry is not null)
            profile.Industry = CleanString(request.Industry);

        if (request.YearsOfWorkExperience.HasValue)
        {
            ValidateExperience(
                request.YearsOfWorkExperience.Value,
                "Years of work experience");

            profile.YearsOfWorkExperience =
                request.YearsOfWorkExperience;
        }

        // EMERGENCY CONTACT
        if (request.EmergencyContactName is not null)
            profile.EmergencyContactName =
                CleanString(request.EmergencyContactName);

        if (request.EmergencyContactNumber is not null)
            profile.EmergencyContactNumber =
                CleanString(request.EmergencyContactNumber);

        if (request.EmergencyContactRelationship is not null)
            profile.EmergencyContactRelationship =
                CleanString(request.EmergencyContactRelationship);

        // VALID ID VERIFICATION FIELDS ARE INTENTIONALLY NOT
        // MODIFIABLE THROUGH THIS GENERAL PROFILE UPDATE.
        // Use a dedicated verification workflow for these fields.
    }

    // =========================================================
    // UPDATE TRAINER INFORMATION
    // =========================================================

    private static void UpdateTrainerInformation(
        TrainerProfile profile,
        UpdateAdminUserRequest request)
    {
        if (request.FirstName is not null)
            profile.FirstName = RequiredString(
                request.FirstName, "First name");

        if (request.MiddleName is not null)
            profile.MiddleName = CleanString(request.MiddleName);

        if (request.LastName is not null)
            profile.LastName = RequiredString(
                request.LastName, "Last name");

        if (request.BirthDate.HasValue)
        {
            if (request.BirthDate.Value > DateOnly.FromDateTime(
                    DateTime.UtcNow))
            {
                throw new InvalidOperationException(
                    "Birth date cannot be in the future.");
            }

            profile.BirthDate = request.BirthDate;
        }

        if (request.Address is not null)
            profile.Address = RequiredString(
                request.Address, "Address");

        if (request.Gender is not null)
            profile.Gender = CleanString(request.Gender);

        if (request.Specialization is not null)
            profile.Specialization = RequiredString(
                request.Specialization, "Specialization");

        if (request.Bio is not null)
            profile.Bio = CleanString(request.Bio);

        if (request.YearsOfExperience.HasValue)
        {
            ValidateExperience(
                request.YearsOfExperience.Value,
                "Years of experience");

            profile.YearsOfExperience =
                request.YearsOfExperience;
        }

        if (request.IsActive.HasValue)
        {
            profile.IsActive = request.IsActive.Value;

            if (profile.IsActive)
                profile.ActivatedAt ??= DateTime.UtcNow;
        }
    }

    // =========================================================
    // LIST DTO MAPPING
    // =========================================================

    private static AdminUserListDto MapToListDto(User user)
    {
        return new AdminUserListDto
        {
            Id = user.Id,
            UserCode = user.UserCode,
            FullName = user.FullName,
            Email = user.Email,
            MobileNumber = user.MobileNumber,
            Role = user.Role,
            Status = user.Status,
            IsEmailVerified = user.IsEmailVerified,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,

            ProfileImageUrl =
                user.Role == UserRole.Participant
                    ? user.ParticipantProfile?.ProfileImageUrl
                    : user.TrainerProfile?.ProfileImageUrl
        };
    }

    // =========================================================
    // DETAILS DTO MAPPING
    // =========================================================

    private static AdminUserDetailsDto MapToDetailsDto(User user)
    {
        var participant = user.ParticipantProfile;
        var trainer = user.TrainerProfile;

        return new AdminUserDetailsDto
        {
            Id = user.Id,
            UserCode = user.UserCode,
            FullName = user.FullName,
            Email = user.Email,
            MobileNumber = user.MobileNumber,
            Role = user.Role,
            Status = user.Status,
            IsEmailVerified = user.IsEmailVerified,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,

            ParticipantProfile = participant is null
                ? null
                : new AdminParticipantProfileDto
                {
                    Id = participant.Id,
                    FirstName = participant.FirstName,
                    MiddleName = participant.MiddleName,
                    LastName = participant.LastName,
                    BirthDate = participant.BirthDate,
                    Address = participant.Address,
                    Gender = participant.Gender,
                    ProfileImageUrl = participant.ProfileImageUrl,

                    // EDUCATIONAL BACKGROUND
                    HighestEducationalAttainment =
                        participant.HighestEducationalAttainment,
                    EducationalStatus =
                        participant.EducationalStatus,
                    SchoolName = participant.SchoolName,
                    CourseOrDegree = participant.CourseOrDegree,
                    FieldOfStudy = participant.FieldOfStudy,
                    YearGraduated = participant.YearGraduated,

                    // EMPLOYMENT INFORMATION
                    EmploymentStatus = participant.EmploymentStatus,
                    CompanyName = participant.CompanyName,
                    JobTitle = participant.JobTitle,
                    Industry = participant.Industry,
                    YearsOfWorkExperience =
                        participant.YearsOfWorkExperience,

                    // VALID ID INFORMATION
                    ValidIdType = participant.ValidIdType,
                    ValidIdNumber = participant.ValidIdNumber,
                    ValidIdImageUrl = participant.ValidIdImageUrl,
                    ValidIdVerificationStatus =
                        participant.ValidIdVerificationStatus,
                    ValidIdRemarks = participant.ValidIdRemarks,
                    ValidIdVerifiedAt = participant.ValidIdVerifiedAt,
                    ValidIdVerifiedBy = participant.ValidIdVerifiedBy,

                    // EMERGENCY CONTACT
                    EmergencyContactName =
                        participant.EmergencyContactName,
                    EmergencyContactNumber =
                        participant.EmergencyContactNumber,
                    EmergencyContactRelationship =
                        participant.EmergencyContactRelationship
                },

            TrainerProfile = trainer is null
                ? null
                : new AdminTrainerProfileDto
                {
                    Id = trainer.Id,
                    FirstName = trainer.FirstName,
                    MiddleName = trainer.MiddleName,
                    LastName = trainer.LastName,
                    BirthDate = trainer.BirthDate,
                    Address = trainer.Address,
                    Gender = trainer.Gender,
                    IsActive = trainer.IsActive,
                    Specialization = trainer.Specialization,
                    Bio = trainer.Bio,
                    YearsOfExperience = trainer.YearsOfExperience,
                    ProfileImageUrl = trainer.ProfileImageUrl,
                    ActivatedAt = trainer.ActivatedAt
                }
        };
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private static bool IsManageableRole(UserRole role)
    {
        return role == UserRole.Participant ||
               role == UserRole.Trainer;
    }

    private static string? CleanString(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    private static string RequiredString(
        string? value,
        string fieldName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new InvalidOperationException(
                $"{fieldName} cannot be empty.");
        }

        return value.Trim();
    }

    private static void ValidateYear(int year, string fieldName)
    {
        var currentYear = DateTime.UtcNow.Year;

        if (year < 1900 || year > currentYear)
        {
            throw new InvalidOperationException(
                $"{fieldName} must be between 1900 and {currentYear}.");
        }
    }

    private static void ValidateExperience(
        int years,
        string fieldName)
    {
        if (years < 0 || years > 100)
        {
            throw new InvalidOperationException(
                $"{fieldName} must be between 0 and 100.");
        }
    }

    private static string BuildFullName(
        string? firstName,
        string? middleName,
        string? lastName)
    {
        return string.Join(
            " ",
            new[] { firstName, middleName, lastName }
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(x => x!.Trim()));
    }

    private void InvalidateUserCache(Guid userId)
{
    // Remove the user list and all cached user details.
    _cache.RemoveByPrefix(UserCachePrefix);

    _logger.LogDebug(
        "Invalidated admin user cache after changing user {UserId}.",
        userId);
}
}
