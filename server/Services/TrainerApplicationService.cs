using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Auth;
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
    // REGISTER TRAINER
    // =========================================================

    public async Task<TrainerApplicationDto?>
        RegisterAsync(
            RegisterTrainerRequest request)
    {
        throw new NotImplementedException(
            "Keep your existing working RegisterAsync implementation here."
        );
    }


    // =========================================================
    // GET MY APPLICATION
    // GET /api/trainer-applications/me
    // =========================================================

    public async Task<TrainerApplicationDto?>
        GetMyApplicationAsync(
            Guid userId)
    {
        var application =
            await _db.TrainerApplications
                .AsNoTracking()
                .Where(
                    x =>
                        x.UserId == userId
                )
                .Select(
                    x =>
                        new TrainerApplicationDto(
                            x.Id,
                            x.UserId,
                            x.User.UserCode,
                            x.User.FullName,
                            x.User.Email,
                            x.User.MobileNumber,
                            x.Specialization,
                            x.YearsOfExperience,
                            x.CertificationName,
                            x.CertificationNumber,
                            x.ProfileImageUrl,
                            x.Status.ToString(),
                            x.AdminRemarks,
                            x.CreatedAt,
                            x.SubmittedAt,
                            x.Documents
                                .Select(
                                    d =>
                                        new TrainerApplicationDocumentDto(
                                            d.Id,
                                            d.DocumentType,
                                            d.FileName,
                                            d.FileUrl,
                                            d.Status.ToString(),
                                            d.ReviewRemarks
                                        )
                                )
                                .ToList()
                        )
                )
                .FirstOrDefaultAsync();


        return application;
    }


    // =========================================================
    // GET APPLICATION BY ID
    // GET /api/trainer-applications/{id}
    // =========================================================

    public async Task<TrainerApplicationDto?>
        GetByIdAsync(
            Guid id)
    {
        var application =
            await _db.TrainerApplications
                .AsNoTracking()
                .Where(
                    x =>
                        x.Id == id
                )
                .Select(
                    x =>
                        new TrainerApplicationDto(
                            x.Id,
                            x.UserId,
                            x.User.UserCode,
                            x.User.FullName,
                            x.User.Email,
                            x.User.MobileNumber,
                            x.Specialization,
                            x.YearsOfExperience,
                            x.CertificationName,
                            x.CertificationNumber,
                            x.ProfileImageUrl,
                            x.Status.ToString(),
                            x.AdminRemarks,
                            x.CreatedAt,
                            x.SubmittedAt,
                            x.Documents
                                .Select(
                                    d =>
                                        new TrainerApplicationDocumentDto(
                                            d.Id,
                                            d.DocumentType,
                                            d.FileName,
                                            d.FileUrl,
                                            d.Status.ToString(),
                                            d.ReviewRemarks
                                        )
                                )
                                .ToList()
                        )
                )
                .FirstOrDefaultAsync();


        return application;
    }


    // =========================================================
    // UPDATE MY APPLICATION
    // PUT /api/trainer-applications/me
    // =========================================================

    public async Task<TrainerApplicationDto?>
        UpdateMyApplicationAsync(
            Guid userId,
            UpdateTrainerApplicationRequest request)
    {
        var application =
            await _db.TrainerApplications
                .Include(
                    x => x.User
                )
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
                "This trainer application can no longer be edited."
            );
        }


        // =====================================================
        // SPECIALIZATION
        // =====================================================

        var specialization =
            request.Specialization?.Trim();


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


        if (
            specialization.Length < 2
        )
        {
            throw new InvalidOperationException(
                "Specialization must contain at least 2 characters."
            );
        }


        // =====================================================
        // YEARS OF EXPERIENCE
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
        // UPDATE
        // =====================================================

        application.Specialization =
            specialization;

        application.YearsOfExperience =
            request.YearsOfExperience;

        application.CertificationName =
            CleanString(
                request.CertificationName
            );

        application.CertificationNumber =
            CleanString(
                request.CertificationNumber
            );


        // If correction was previously requested,
        // return application to Pending after correction.

        if (
            application.Status ==
            TrainerApplicationStatus.NeedsCorrection
        )
        {
            application.Status =
                TrainerApplicationStatus.Pending;

            application.SubmittedAt =
                DateTime.UtcNow;
        }


        application.User.UpdatedAt =
            DateTime.UtcNow;


        await _db.SaveChangesAsync();


        return await GetMyApplicationAsync(
            userId
        );
    }


    // =========================================================
    // UPDATE APPLICATION PROFILE IMAGE
    // PUT /api/trainer-applications/me/image
    // =========================================================

    public async Task<TrainerApplicationDto?>
        UpdateProfileImageAsync(
            Guid userId,
            IFormFile profileImage)
    {
        var application =
            await _db.TrainerApplications
                .Include(
                    x => x.User
                )
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
                "The trainer application can no longer be edited."
            );
        }


        // =====================================================
        // FILE CHECK
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
                "Profile image is empty."
            );
        }


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
        // CLOUDINARY
        // =====================================================

        await using var stream =
            profileImage.OpenReadStream();


        var imageUrl =
            await _cloudinaryService
                .UploadImageAsync(
                    stream,
                    profileImage.FileName,
                    "ace-nextgen/trainers"
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


        application.ProfileImageUrl =
            imageUrl;


        application.User.UpdatedAt =
            DateTime.UtcNow;


        await _db.SaveChangesAsync();


        return await GetMyApplicationAsync(
            userId
        );
    }


    // =========================================================
    // UPLOAD DOCUMENT
    // POST /api/trainer-applications/{id}/documents
    // =========================================================

    public async Task<TrainerApplicationDocumentDto>
        UploadDocumentAsync(
            Guid userId,
            Guid applicationId,
            UploadTrainerApplicationDocumentRequest request)
    {
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
        // CLOUDINARY
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
    // GET /api/trainer-applications/{id}/documents
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


        return await _db
            .TrainerApplicationDocuments
            .AsNoTracking()
            .Where(
                x =>
                    x.TrainerApplicationId ==
                    applicationId
            )
            .OrderByDescending(
                x => x.UploadedAt
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
    // DELETE /api/trainer-applications/{id}/documents/{documentId}
    // =========================================================

    public async Task DeleteDocumentAsync(
        Guid userId,
        Guid applicationId,
        Guid documentId)
    {
        var document =
            await _db
                .TrainerApplicationDocuments
                .Include(
                    x => x.TrainerApplication
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
                "Trainer application document was not found."
            );
        }


        if (
            document.Status ==
            DocumentStatus.Approved
        )
        {
            throw new InvalidOperationException(
                "An approved document cannot be deleted."
            );
        }


        if (
            document.TrainerApplication.Status !=
                TrainerApplicationStatus.Pending
            &&
            document.TrainerApplication.Status !=
                TrainerApplicationStatus.NeedsCorrection
        )
        {
            throw new InvalidOperationException(
                "This trainer application can no longer be modified."
            );
        }


        _db.TrainerApplicationDocuments
            .Remove(document);


        await _db.SaveChangesAsync();
    }


    // =========================================================
    // ADMIN REVIEW APPLICATION
    // =========================================================

    public async Task ReviewAsync(
        Guid applicationId,
        Guid adminId,
        ReviewTrainerApplicationRequest request)
    {
        var application =
            await _db.TrainerApplications
                .Include(
                    x => x.User
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
        // VALIDATE DECISION
        // =====================================================

        if (
            !string.Equals(
                decision,
                "Approved",
                StringComparison.OrdinalIgnoreCase
            )
            &&
            !string.Equals(
                decision,
                "Rejected",
                StringComparison.OrdinalIgnoreCase
            )
            &&
            !string.Equals(
                decision,
                "NeedsCorrection",
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            throw new InvalidOperationException(
                "Invalid review decision."
            );
        }


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

            application.User.Status =
                UserStatus.Active;


            // =================================================
            // CREATE / ACTIVATE TRAINER PROFILE
            // =================================================

            var trainerProfile =
                await _db.TrainerProfiles
                    .FirstOrDefaultAsync(
                        x =>
                            x.UserId ==
                            application.UserId
                    );


            if (trainerProfile is null)
            {
                trainerProfile =
                    new TrainerProfile
                    {
                        Id =
                            Guid.NewGuid(),

                        UserId =
                            application.UserId,

                        IsActive =
                            true,

                        Specialization =
                            application.Specialization,

                        Bio =
                            null,

                        YearsOfExperience =
                            application.YearsOfExperience,

                        ProfileImageUrl =
                            application.ProfileImageUrl,

                        ActivatedAt =
                            DateTime.UtcNow
                    };


                _db.TrainerProfiles
                    .Add(
                        trainerProfile
                    );
            }
            else
            {
                trainerProfile.IsActive =
                    true;

                trainerProfile.Specialization =
                    application.Specialization;

                trainerProfile.YearsOfExperience =
                    application.YearsOfExperience;

                trainerProfile.ProfileImageUrl =
                    application.ProfileImageUrl;

                trainerProfile.ActivatedAt =
                    DateTime.UtcNow;
            }
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
            }
        }


        // =====================================================
        // NEEDS CORRECTION
        // =====================================================

        else
        {
            application.Status =
                TrainerApplicationStatus.NeedsCorrection;

            application.User.Status =
                UserStatus.Pending;
        }


        application.AdminRemarks =
            CleanString(
                request.Remarks
            );


        application.ReviewedByUserId =
            adminId;


        application.ReviewedAt =
            DateTime.UtcNow;


        application.User.UpdatedAt =
            DateTime.UtcNow;


        await _db.SaveChangesAsync();
    }


    // =========================================================
    // ADMIN REVIEW DOCUMENT
    // =========================================================

    public async Task ReviewDocumentAsync(
        Guid applicationId,
        Guid documentId,
        Guid adminId,
        ReviewTrainerApplicationDocumentRequest request)
    {
        var document =
            await _db
                .TrainerApplicationDocuments
                .Include(
                    x => x.TrainerApplication
                )
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


        var decision =
            request.Decision.Trim();


        // =====================================================
        // VALIDATE DECISION
        // =====================================================

        if (
            !string.Equals(
                decision,
                "Approved",
                StringComparison.OrdinalIgnoreCase
            )
            &&
            !string.Equals(
                decision,
                "Rejected",
                StringComparison.OrdinalIgnoreCase
            )
            &&
            !string.Equals(
                decision,
                "NeedsCorrection",
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            throw new InvalidOperationException(
                "Invalid document review decision."
            );
        }


        // =====================================================
        // STATUS
        // =====================================================

        if (
            string.Equals(
                decision,
                "Approved",
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            document.Status =
                DocumentStatus.Approved;
        }
        else if (
            string.Equals(
                decision,
                "Rejected",
                StringComparison.OrdinalIgnoreCase
            )
        )
        {
            document.Status =
                DocumentStatus.Rejected;
        }
        else
        {
            document.Status =
                DocumentStatus.NeedsCorrection;
        }


        document.ReviewRemarks =
            CleanString(
                request.Remarks
            );


        document.ReviewedByUserId =
            adminId;


        document.ReviewedAt =
            DateTime.UtcNow;


        await _db.SaveChangesAsync();
    }


    // =========================================================
    // GET MY TRAINER PROFILE
    // GET /api/trainer-profiles/me
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
                        x.Specialization,
                        x.Bio,
                        x.YearsOfExperience,
                        x.ProfileImageUrl,
                        x.IsActive,
                        x.ActivatedAt
                    )
            )
            .FirstOrDefaultAsync();
    }


    // =========================================================
    // UPDATE MY TRAINER PROFILE
    // PUT /api/trainer-profiles/me
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
                        &&
                        x.IsActive
                );


        if (profile is null)
        {
            return null;
        }


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


        if (
            specialization.Length < 2
        )
        {
            throw new InvalidOperationException(
                "Specialization must contain at least 2 characters."
            );
        }


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


        profile.Specialization =
            specialization;

        profile.Bio =
            CleanString(
                request.Bio
            );

        profile.YearsOfExperience =
            request.YearsOfExperience;


        if (
            request.MobileNumber is not null
        )
        {
            profile.User.MobileNumber =
                CleanString(
                    request.MobileNumber
                );
        }


        profile.User.UpdatedAt =
            DateTime.UtcNow;


        await _db.SaveChangesAsync();


        return await GetMyProfileAsync(
            userId
        );
    }


    // =========================================================
    // GET TRAINER PROFILE BY ID
    // GET /api/trainer-profiles/{id}
    // =========================================================

    public async Task<TrainerProfileDto?>
        GetByIdProfileAsync(
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
                        x.Specialization,
                        x.Bio,
                        x.YearsOfExperience,
                        x.ProfileImageUrl,
                        x.IsActive,
                        x.ActivatedAt
                    )
            )
            .FirstOrDefaultAsync();
    }


    // =========================================================
    // GET ACTIVE TRAINERS
    // GET /api/trainer-profiles/active
    // =========================================================

    public async Task<List<TrainerProfileDto>>
        GetActiveTrainersAsync()
    {
        return await _db.TrainerProfiles
            .AsNoTracking()
            .Where(
                x =>
                    x.IsActive
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
                        x.Specialization,
                        x.Bio,
                        x.YearsOfExperience,
                        x.ProfileImageUrl,
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