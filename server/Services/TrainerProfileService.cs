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
                        // Profile
                        x.Id,
                        x.UserId,

                        // User
                        x.User.UserCode,
                        x.User.FullName,
                        x.User.Email,

                        // Personal
                        x.FirstName,
                        x.MiddleName,
                        x.LastName,
                        x.Suffix,
                        x.BirthDate,
                        x.Gender,
                        x.User.MobileNumber,
                        x.Address,

                        // Professional
                        x.Specialization,
                        x.ProfessionalTitle,
                        x.CurrentOrganization,
                        x.Bio,
                        x.YearsOfExperience,

                        // License
                        x.ProfessionalLicenseNumber,
                        x.ProfessionalLicenseType,
                        x.ProfessionalLicenseExpirationDate,

                        // Education
                        x.Educations
                            .Select(
                                education =>
                                    new TrainerEducationDto(
                                        education.Id,
                                        education.TrainerProfileId,
                                        education.Degree,
                                        education.FieldOfStudy,
                                        education.Institution,
                                        education.YearGraduated
                                    )
                            )
                            .ToList(),

                        // Certifications
                        x.Certifications
                            .Select(
                                certification =>
                                    new TrainerCertificationDto(
                                        certification.Id,
                                        certification.TrainerProfileId,
                                        certification.Name,
                                        certification.IssuingOrganization,
                                        certification.IssuedDate,
                                        certification.ExpirationDate,
                                        certification.CertificateUrl
                                    )
                            )
                            .ToList(),

                        // Profile
                        x.ProfileImageUrl,

                        // Status
                        x.IsActive,
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
        // SUFFIX
        // =====================================================

        if (
            request.Suffix is not null
        )
        {
            profile.Suffix =
                CleanString(
                    request.Suffix
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
        // PROFESSIONAL TITLE
        // =====================================================

        if (
            request.ProfessionalTitle is not null
        )
        {
            profile.ProfessionalTitle =
                CleanString(
                    request.ProfessionalTitle
                );
        }


        // =====================================================
        // CURRENT ORGANIZATION
        // =====================================================

        if (
            request.CurrentOrganization is not null
        )
        {
            profile.CurrentOrganization =
                CleanString(
                    request.CurrentOrganization
                );
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
        // PROFESSIONAL LICENSE NUMBER
        // =====================================================

        if (
            request.ProfessionalLicenseNumber is not null
        )
        {
            profile.ProfessionalLicenseNumber =
                CleanString(
                    request.ProfessionalLicenseNumber
                );
        }


        // =====================================================
        // PROFESSIONAL LICENSE TYPE
        // =====================================================

        if (
            request.ProfessionalLicenseType is not null
        )
        {
            profile.ProfessionalLicenseType =
                CleanString(
                    request.ProfessionalLicenseType
                );
        }


        // =====================================================
        // LICENSE EXPIRATION DATE
        // =====================================================

        if (
            request.ProfessionalLicenseExpirationDate
                .HasValue
        )
        {
            profile.ProfessionalLicenseExpirationDate =
                request.ProfessionalLicenseExpirationDate;
        }


        // =====================================================
        // REBUILD FULL NAME
        // =====================================================

        var nameParts =
            new[]
            {
                profile.FirstName,
                profile.MiddleName,
                profile.LastName,
                profile.Suffix
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
                        // Profile
                        x.Id,
                        x.UserId,

                        // User
                        x.User.UserCode,
                        x.User.FullName,
                        x.User.Email,

                        // Personal
                        x.FirstName,
                        x.MiddleName,
                        x.LastName,
                        x.Suffix,
                        x.BirthDate,
                        x.Gender,
                        x.User.MobileNumber,
                        x.Address,

                        // Professional
                        x.Specialization,
                        x.ProfessionalTitle,
                        x.CurrentOrganization,
                        x.Bio,
                        x.YearsOfExperience,

                        // License
                        x.ProfessionalLicenseNumber,
                        x.ProfessionalLicenseType,
                        x.ProfessionalLicenseExpirationDate,

                        // Education
                        x.Educations
                            .Select(
                                education =>
                                    new TrainerEducationDto(
                                        education.Id,
                                        education.TrainerProfileId,
                                        education.Degree,
                                        education.FieldOfStudy,
                                        education.Institution,
                                        education.YearGraduated
                                    )
                            )
                            .ToList(),

                        // Certifications
                        x.Certifications
                            .Select(
                                certification =>
                                    new TrainerCertificationDto(
                                        certification.Id,
                                        certification.TrainerProfileId,
                                        certification.Name,
                                        certification.IssuingOrganization,
                                        certification.IssuedDate,
                                        certification.ExpirationDate,
                                        certification.CertificateUrl
                                    )
                            )
                            .ToList(),

                        // Profile
                        x.ProfileImageUrl,

                        // Status
                        x.IsActive,
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
                        // Profile
                        x.Id,
                        x.UserId,

                        // User
                        x.User.UserCode,
                        x.User.FullName,
                        x.User.Email,

                        // Personal
                        x.FirstName,
                        x.MiddleName,
                        x.LastName,
                        x.Suffix,
                        x.BirthDate,
                        x.Gender,
                        x.User.MobileNumber,
                        x.Address,

                        // Professional
                        x.Specialization,
                        x.ProfessionalTitle,
                        x.CurrentOrganization,
                        x.Bio,
                        x.YearsOfExperience,

                        // License
                        x.ProfessionalLicenseNumber,
                        x.ProfessionalLicenseType,
                        x.ProfessionalLicenseExpirationDate,

                        // Education
                        x.Educations
                            .Select(
                                education =>
                                    new TrainerEducationDto(
                                        education.Id,
                                        education.TrainerProfileId,
                                        education.Degree,
                                        education.FieldOfStudy,
                                        education.Institution,
                                        education.YearGraduated
                                    )
                            )
                            .ToList(),

                        // Certifications
                        x.Certifications
                            .Select(
                                certification =>
                                    new TrainerCertificationDto(
                                        certification.Id,
                                        certification.TrainerProfileId,
                                        certification.Name,
                                        certification.IssuingOrganization,
                                        certification.IssuedDate,
                                        certification.ExpirationDate,
                                        certification.CertificateUrl
                                    )
                            )
                            .ToList(),

                        // Profile
                        x.ProfileImageUrl,

                        // Status
                        x.IsActive,
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