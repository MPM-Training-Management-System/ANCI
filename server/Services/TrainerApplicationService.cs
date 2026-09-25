using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Trainer;
using server.Enums;
using server.Models.Trainer;
using server.Services.Interfaces;

namespace server.Services;

public class TrainerApplicationService
    : ITrainerApplicationService
{
    private readonly ApplicationDbContext _db;

    private readonly ICloudinaryService
        _cloudinaryService;


    public TrainerApplicationService(
        ApplicationDbContext db,
        ICloudinaryService cloudinaryService)
    {
        _db = db;

        _cloudinaryService =
            cloudinaryService;
    }


    // =========================================================
    // GET MY APPLICATION
    // =========================================================

    public async Task<TrainerApplicationDto?>
        GetMyApplicationAsync(
            Guid userId)
    {
        return await _db.TrainerApplications
            .AsNoTracking()
            .Where(
                x =>
                    x.UserId == userId
            )
            .Select(
                x =>
                    MapApplication(x)
            )
            .FirstOrDefaultAsync();
    }


    // =========================================================
    // ADMIN - GET ALL APPLICATIONS
    // =========================================================

    public async Task<List<TrainerApplicationDto>>
        GetAllAsync()
    {
        return await _db.TrainerApplications
            .AsNoTracking()
            .OrderByDescending(
                x =>
                    x.CreatedAt
            )
            .Select(
                x =>
                    MapApplication(x)
            )
            .ToListAsync();
    }


    // =========================================================
    // GET APPLICATION BY ID
    // =========================================================

    public async Task<TrainerApplicationDto?>
        GetByIdAsync(
            Guid id)
    {
        return await _db.TrainerApplications
            .AsNoTracking()
            .Where(
                x =>
                    x.Id == id
            )
            .Select(
                x =>
                    MapApplication(x)
            )
            .FirstOrDefaultAsync();
    }


    // =========================================================
    // UPDATE MY APPLICATION
    // =========================================================

    public async Task<TrainerApplicationDto?>
        UpdateMyApplicationAsync(
            Guid userId,
            UpdateTrainerApplicationRequest request)
    {
        var application =
            await _db.TrainerApplications
                .FirstOrDefaultAsync(
                    x =>
                        x.UserId == userId
                );

        if (application is null)
        {
            return null;
        }


        // =====================================================
        // STATUS CHECK
        // =====================================================

        if (
            application.Status !=
                TrainerApplicationStatus.Pending
            &&
            application.Status !=
                TrainerApplicationStatus.NeedsCorrection
        )
        {
            throw new InvalidOperationException(
                "This application can no longer be edited."
            );
        }


        // =====================================================
        // FIRST NAME
        // =====================================================

        if (
            request.FirstName is not null
        )
        {
            application.FirstName =
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
            application.MiddleName =
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
            application.LastName =
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
            application.Suffix =
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
            application.BirthDate =
                request.BirthDate;
        }


        // =====================================================
        // GENDER
        // =====================================================

        if (
            request.Gender is not null
        )
        {
            application.Gender =
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
            application.Address =
                CleanString(
                    request.Address
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
                    "Specialization is required."
                );
            }

            application.Specialization =
                specialization;
        }


        // =====================================================
        // PROFESSIONAL TITLE
        // =====================================================

        if (
            request.ProfessionalTitle is not null
        )
        {
            application.ProfessionalTitle =
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
            application.CurrentOrganization =
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
            application.Bio =
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

            application.YearsOfExperience =
                request.YearsOfExperience;
        }


        // =====================================================
        // PROFESSIONAL LICENSE NUMBER
        // =====================================================

        if (
            request.ProfessionalLicenseNumber
            is not null
        )
        {
            application.ProfessionalLicenseNumber =
                CleanString(
                    request.ProfessionalLicenseNumber
                );
        }


        // =====================================================
        // PROFESSIONAL LICENSE TYPE
        // =====================================================

        if (
            request.ProfessionalLicenseType
            is not null
        )
        {
            application.ProfessionalLicenseType =
                CleanString(
                    request.ProfessionalLicenseType
                );
        }


        // =====================================================
        // LICENSE EXPIRATION
        // =====================================================

        if (
            request.ProfessionalLicenseExpirationDate
                .HasValue
        )
        {
            application.ProfessionalLicenseExpirationDate =
                request.ProfessionalLicenseExpirationDate;
        }


        // =====================================================
        // REBUILD USER FULL NAME
        // =====================================================

        var nameParts =
            new[]
            {
                application.FirstName,
                application.MiddleName,
                application.LastName,
                application.Suffix
            }
            .Where(
                x =>
                    !string.IsNullOrWhiteSpace(x)
            )
            .Select(
                x =>
                    x!.Trim()
            );

        application.User.FullName =
            string.Join(
                " ",
                nameParts
            );

        application.User.UpdatedAt =
            DateTime.UtcNow;


        // =====================================================
        // RESUBMIT CORRECTION
        // =====================================================

        if (
            application.Status ==
            TrainerApplicationStatus.NeedsCorrection
        )
        {
            application.Status =
                TrainerApplicationStatus.Pending;

            application.SubmittedAt =
                DateTime.UtcNow;

            application.AdminRemarks =
                null;
        }


        // =====================================================
        // SAVE
        // =====================================================

        await _db.SaveChangesAsync();


        return await GetMyApplicationAsync(
            userId
        );
    }


    // =========================================================
    // UPDATE PROFILE IMAGE
    // =========================================================

    public async Task<TrainerApplicationDto?>
        UpdateProfileImageAsync(
            Guid userId,
            IFormFile profileImage)
    {
        var application =
            await _db.TrainerApplications
                .FirstOrDefaultAsync(
                    x =>
                        x.UserId == userId
                );

        if (application is null)
        {
            return null;
        }


        // =====================================================
        // STATUS CHECK
        // =====================================================

        if (
            application.Status !=
                TrainerApplicationStatus.Pending
            &&
            application.Status !=
                TrainerApplicationStatus.NeedsCorrection
        )
        {
            throw new InvalidOperationException(
                "This application can no longer be modified."
            );
        }


        // =====================================================
        // FILE CHECK
        // =====================================================

        if (
            profileImage is null
            ||
            profileImage.Length == 0
        )
        {
            throw new InvalidOperationException(
                "Profile image is required."
            );
        }


        // =====================================================
        // MAX FILE SIZE
        // 5 MB
        // =====================================================

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
        // CONTENT TYPE
        // =====================================================

        var allowedContentTypes =
            new[]
            {
                "image/jpeg",
                "image/png",
                "image/webp"
            };

        var contentType =
            profileImage.ContentType
                .ToLowerInvariant();

        if (
            !allowedContentTypes.Contains(
                contentType
            )
        )
        {
            throw new InvalidOperationException(
                "Only JPG, PNG, and WEBP images are allowed."
            );
        }


        // =====================================================
        // UPLOAD
        // =====================================================

        await using var stream =
            profileImage.OpenReadStream();

        var fileUrl =
            await _cloudinaryService
                .UploadImageAsync(
                    stream,
                    profileImage.FileName,
                    "ace-nextgen/trainer-applications/profile"
                );


        if (
            string.IsNullOrWhiteSpace(
                fileUrl
            )
        )
        {
            throw new InvalidOperationException(
                "Profile image upload failed."
            );
        }


        // =====================================================
        // SAVE URL
        // =====================================================

        application.ProfileImageUrl =
            fileUrl;


        await _db.SaveChangesAsync();


        return await GetMyApplicationAsync(
            userId
        );
    }


    // =========================================================
    // UPLOAD DOCUMENT
    // =========================================================

    public async Task<TrainerApplicationDocumentDto>
        UploadDocumentAsync(
            Guid userId,
            Guid applicationId,
            UploadTrainerApplicationDocumentRequest request)
    {
        // =====================================================
        // FIND APPLICATION
        // =====================================================

        var application =
            await _db.TrainerApplications
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == applicationId
                        &&
                        x.UserId == userId
                );

        if (application is null)
        {
            throw new KeyNotFoundException(
                "Trainer application was not found."
            );
        }


        // =====================================================
        // STATUS CHECK
        // =====================================================

        if (
            application.Status !=
                TrainerApplicationStatus.Pending
            &&
            application.Status !=
                TrainerApplicationStatus.NeedsCorrection
        )
        {
            throw new InvalidOperationException(
                "This trainer application can no longer be modified."
            );
        }


        // =====================================================
        // FILE CHECK
        // =====================================================

        if (request.File is null)
        {
            throw new InvalidOperationException(
                "Document file is required."
            );
        }


        if (request.File.Length <= 0)
        {
            throw new InvalidOperationException(
                "Document file is empty."
            );
        }


        // =====================================================
        // MAX FILE SIZE
        // =====================================================

        const long maxFileSize =
            10 * 1024 * 1024;

        if (
            request.File.Length >
            maxFileSize
        )
        {
            throw new InvalidOperationException(
                "Document must not exceed 10 MB."
            );
        }


        // =====================================================
        // DOCUMENT TYPE
        // =====================================================

        var documentType =
            request.DocumentType?.Trim();

        if (
            string.IsNullOrWhiteSpace(
                documentType
            )
        )
        {
            throw new InvalidOperationException(
                "Document type is required."
            );
        }


        // =====================================================
        // FILE TYPE
        // =====================================================

        var allowedContentTypes =
            new[]
            {
                "application/pdf",
                "image/jpeg",
                "image/png",
                "image/webp"
            };

        var contentType =
            request.File.ContentType
                .ToLowerInvariant();

        if (
            !allowedContentTypes.Contains(
                contentType
            )
        )
        {
            throw new InvalidOperationException(
                "Only PDF, JPG, PNG, and WEBP files are allowed."
            );
        }


        // =====================================================
        // UPLOAD TO CLOUDINARY
        // =====================================================

        await using var stream =
            request.File.OpenReadStream();

        var fileUrl =
            await _cloudinaryService
                .UploadImageAsync(
                    stream,
                    request.File.FileName,
                    "ace-nextgen/trainer-applications/documents"
                );


        if (
            string.IsNullOrWhiteSpace(
                fileUrl
            )
        )
        {
            throw new InvalidOperationException(
                "Document upload failed."
            );
        }


        // =====================================================
        // CREATE DOCUMENT
        // =====================================================

        var document =
            new TrainerApplicationDocument
            {
                Id =
                    Guid.NewGuid(),

                TrainerApplicationId =
                    application.Id,

                DocumentType =
                    documentType,

                FileName =
                    request.File.FileName,

                FileUrl =
                    fileUrl,

                Status =
                    DocumentStatus.Pending,

                ReviewRemarks =
                    null,

                ReviewedByUserId =
                    null,

                ReviewedAt =
                    null,

                UploadedAt =
                    DateTime.UtcNow
            };


        _db.TrainerApplicationDocuments
            .Add(document);


        await _db.SaveChangesAsync();


        return new TrainerApplicationDocumentDto(
            document.Id,
            document.DocumentType,
            document.FileName,
            document.FileUrl,
            document.Status.ToString(),
            document.ReviewRemarks
        );
    }


    // =========================================================
    // GET MY DOCUMENTS
    // =========================================================

    public async Task<List<TrainerApplicationDocumentDto>>
        GetMyDocumentsAsync(
            Guid userId,
            Guid applicationId)
    {
        var ownsApplication =
            await _db.TrainerApplications
                .AnyAsync(
                    x =>
                        x.Id == applicationId
                        &&
                        x.UserId == userId
                );

        if (!ownsApplication)
        {
            throw new KeyNotFoundException(
                "Trainer application was not found."
            );
        }


        return await _db.TrainerApplicationDocuments
            .AsNoTracking()
            .Where(
                x =>
                    x.TrainerApplicationId ==
                    applicationId
            )
            .OrderByDescending(
                x =>
                    x.UploadedAt
            )
            .Select(
                x =>
                    new TrainerApplicationDocumentDto(
                        x.Id,
                        x.DocumentType,
                        x.FileName,
                        x.FileUrl,
                        x.Status.ToString(),
                        x.ReviewRemarks
                    )
            )
            .ToListAsync();
    }


    // =========================================================
    // DELETE DOCUMENT
    // =========================================================

    public async Task DeleteDocumentAsync(
        Guid userId,
        Guid applicationId,
        Guid documentId)
    {
        var document =
            await _db.TrainerApplicationDocuments
                .Include(
                    x =>
                        x.TrainerApplication
                )
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == documentId
                        &&
                        x.TrainerApplicationId ==
                        applicationId
                        &&
                        x.TrainerApplication.UserId ==
                        userId
                );

        if (document is null)
        {
            throw new KeyNotFoundException(
                "Document was not found."
            );
        }


        if (
            document.Status ==
            DocumentStatus.Approved
        )
        {
            throw new InvalidOperationException(
                "Approved documents cannot be deleted."
            );
        }


        _db.TrainerApplicationDocuments
            .Remove(
                document
            );


        await _db.SaveChangesAsync();
    }


    // =========================================================
    // ADMIN - REVIEW APPLICATION
    // =========================================================

    public async Task ReviewAsync(
        Guid applicationId,
        Guid adminId,
        ReviewTrainerApplicationRequest request)
    {
        var application =
            await _db.TrainerApplications
                .Include(
                    x =>
                        x.User
                )
                .Include(
                    x =>
                        x.Educations
                )
                .Include(
                    x =>
                        x.Certifications
                )
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == applicationId
                );


        if (application is null)
        {
            throw new KeyNotFoundException(
                "Trainer application was not found."
            );
        }


        var decision =
            request.Decision.Trim();


        // =====================================================
        // APPROVED
        // =====================================================

        if (
            string.Equals(
                decision,
                "Approved",
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            application.Status =
                TrainerApplicationStatus.Approved;


            // =================================================
            // ACTIVATE USER
            // =================================================

            application.User.Status =
                UserStatus.Active;

            application.User.UpdatedAt =
                DateTime.UtcNow;


            // =================================================
            // FIND TRAINER PROFILE
            // =================================================

            var trainerProfile =
                await _db.TrainerProfiles
                    .Include(
                        x =>
                            x.Educations
                    )
                    .Include(
                        x =>
                            x.Certifications
                    )
                    .FirstOrDefaultAsync(
                        x =>
                            x.UserId ==
                            application.UserId
                    );


            if (trainerProfile is null)
            {
                throw new InvalidOperationException(
                    "Trainer profile was not found for this application."
                );
            }


            // =================================================
            // COPY PERSONAL INFORMATION
            // =================================================

            trainerProfile.FirstName =
                application.FirstName;

            trainerProfile.MiddleName =
                application.MiddleName;

            trainerProfile.LastName =
                application.LastName;

            trainerProfile.Suffix =
                application.Suffix;

            trainerProfile.BirthDate =
                application.BirthDate;

            trainerProfile.Gender =
                application.Gender;

            trainerProfile.Address =
                application.Address;


            // =================================================
            // COPY PROFESSIONAL INFORMATION
            // =================================================

            trainerProfile.Specialization =
                application.Specialization;

            trainerProfile.ProfessionalTitle =
                application.ProfessionalTitle;

            trainerProfile.CurrentOrganization =
                application.CurrentOrganization;

            trainerProfile.Bio =
                application.Bio;

            trainerProfile.YearsOfExperience =
                application.YearsOfExperience;


            // =================================================
            // COPY LICENSE
            // =================================================

            trainerProfile.ProfessionalLicenseNumber =
                application.ProfessionalLicenseNumber;

            trainerProfile.ProfessionalLicenseType =
                application.ProfessionalLicenseType;

            trainerProfile.ProfessionalLicenseExpirationDate =
                application.ProfessionalLicenseExpirationDate;


            // =================================================
            // COPY PROFILE IMAGE
            // =================================================

            trainerProfile.ProfileImageUrl =
                application.ProfileImageUrl;


            // =================================================
            // REMOVE EXISTING EDUCATION
            // =================================================

            _db.TrainerEducations.RemoveRange(
                trainerProfile.Educations
            );


            // =================================================
            // COPY EDUCATION
            // =================================================

            foreach (
                var education
                in application.Educations
            )
            {
                trainerProfile.Educations.Add(
                    new TrainerEducation
                    {
                        Id =
                            Guid.NewGuid(),

                        TrainerProfileId =
                            trainerProfile.Id,

                        Degree =
                            education.Degree,

                        FieldOfStudy =
                            education.FieldOfStudy,

                        Institution =
                            education.Institution,

                        YearGraduated =
                            education.YearGraduated
                    }
                );
            }


            // =================================================
            // REMOVE EXISTING CERTIFICATIONS
            // =================================================

            _db.TrainerCertifications.RemoveRange(
                trainerProfile.Certifications
            );


            // =================================================
            // COPY CERTIFICATIONS
            // =================================================

            foreach (
                var certification
                in application.Certifications
            )
            {
                trainerProfile.Certifications.Add(
                    new TrainerCertification
                    {
                        Id =
                            Guid.NewGuid(),

                        TrainerProfileId =
                            trainerProfile.Id,

                        Name =
                            certification.Name,

                        IssuingOrganization =
                            certification.IssuingOrganization,

                        IssuedDate =
                            certification.IssuedDate,

                        ExpirationDate =
                            certification.ExpirationDate,

                        CertificateUrl =
                            certification.CertificateUrl
                    }
                );
            }


            // =================================================
            // ACTIVATE TRAINER PROFILE
            // =================================================

            trainerProfile.IsActive =
                true;

            trainerProfile.ActivatedAt =
                DateTime.UtcNow;
        }


        // =====================================================
        // REJECTED
        // =====================================================

        else if (
            string.Equals(
                decision,
                "Rejected",
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            application.Status =
                TrainerApplicationStatus.Rejected;

            application.User.Status =
                UserStatus.Rejected;

            application.User.UpdatedAt =
                DateTime.UtcNow;


            var trainerProfile =
                await _db.TrainerProfiles
                    .FirstOrDefaultAsync(
                        x =>
                            x.UserId ==
                            application.UserId
                    );


            if (trainerProfile is not null)
            {
                trainerProfile.IsActive =
                    false;

                trainerProfile.ActivatedAt =
                    null;
            }
        }


        // =====================================================
        // NEEDS CORRECTION
        // =====================================================

        else if (
            string.Equals(
                decision,
                "NeedsCorrection",
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            application.Status =
                TrainerApplicationStatus.NeedsCorrection;

            application.User.Status =
                UserStatus.Pending;

            application.User.UpdatedAt =
                DateTime.UtcNow;


            var trainerProfile =
                await _db.TrainerProfiles
                    .FirstOrDefaultAsync(
                        x =>
                            x.UserId ==
                            application.UserId
                    );


            if (trainerProfile is not null)
            {
                trainerProfile.IsActive =
                    false;

                trainerProfile.ActivatedAt =
                    null;
            }
        }


        // =====================================================
        // INVALID DECISION
        // =====================================================

        else
        {
            throw new InvalidOperationException(
                "Invalid review decision."
            );
        }


        // =====================================================
        // ADMIN REVIEW INFORMATION
        // =====================================================

        application.AdminRemarks =
            CleanString(
                request.Remarks
            );

        application.ReviewedByUserId =
            adminId;

        application.ReviewedAt =
            DateTime.UtcNow;


        // =====================================================
        // SAVE
        // =====================================================

        await _db.SaveChangesAsync();
    }


    // =========================================================
    // ADMIN - REVIEW DOCUMENT
    // =========================================================

    public async Task ReviewDocumentAsync(
        Guid applicationId,
        Guid documentId,
        Guid adminId,
        ReviewTrainerApplicationDocumentRequest request)
    {
        var document =
            await _db.TrainerApplicationDocuments
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == documentId
                        &&
                        x.TrainerApplicationId ==
                        applicationId
                );


        if (document is null)
        {
            throw new KeyNotFoundException(
                "Trainer application document was not found."
            );
        }


        document.Status =
            request.Status;

        document.ReviewRemarks =
            CleanString(
                request.ReviewRemarks
            );

        document.ReviewedByUserId =
            adminId;

        document.ReviewedAt =
            DateTime.UtcNow;


        await _db.SaveChangesAsync();
    }


    // =========================================================
    // MAP APPLICATION TO DTO
    // =========================================================

    private static TrainerApplicationDto
        MapApplication(
            TrainerApplication x)
    {
        return new TrainerApplicationDto(
            // =================================================
            // BASIC
            // =================================================

            x.Id,
            x.UserId,

            // =================================================
            // USER
            // =================================================

            x.User.UserCode,
            x.User.FullName,
            x.User.Email,
            x.User.MobileNumber,

            // =================================================
            // PERSONAL
            // =================================================

            x.FirstName,
            x.MiddleName,
            x.LastName,
            x.Suffix,
            x.BirthDate,
            x.Gender,
            x.Address,

            // =================================================
            // PROFESSIONAL
            // =================================================

            x.Specialization,
            x.ProfessionalTitle,
            x.CurrentOrganization,
            x.Bio,
            x.YearsOfExperience,

            // =================================================
            // LICENSE
            // =================================================

            x.ProfessionalLicenseNumber,
            x.ProfessionalLicenseType,
            x.ProfessionalLicenseExpirationDate,

            // =================================================
            // PROFILE
            // =================================================

            x.ProfileImageUrl,

            // =================================================
            // STATUS
            // =================================================

            x.Status.ToString(),
            x.AdminRemarks,

            x.CreatedAt,
            x.SubmittedAt,

            // =================================================
            // EDUCATION
            // =================================================

            x.Educations
                .Select(
                    education =>
                        new TrainerApplicationEducationDto(
                            education.Id,
                            education.Degree,
                            education.FieldOfStudy,
                            education.Institution,
                            education.YearGraduated
                        )
                )
                .ToList(),

            // =================================================
            // CERTIFICATIONS
            // =================================================

            x.Certifications
                .Select(
                    certification =>
                        new TrainerApplicationCertificationDto(
                            certification.Id,
                            certification.Name,
                            certification.IssuingOrganization,
                            certification.IssuedDate,
                            certification.ExpirationDate,
                            certification.CertificateUrl
                        )
                )
                .ToList(),

            // =================================================
            // DOCUMENTS
            // =================================================

            x.Documents
                .Select(
                    document =>
                        new TrainerApplicationDocumentDto(
                            document.Id,
                            document.DocumentType,
                            document.FileName,
                            document.FileUrl,
                            document.Status.ToString(),
                            document.ReviewRemarks
                        )
                )
                .ToList()
        );
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