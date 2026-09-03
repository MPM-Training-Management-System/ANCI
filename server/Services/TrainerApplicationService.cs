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
                x => x.CreatedAt
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
        // CERTIFICATION
        // =====================================================

        if (
            request.CertificationName is not null
        )
        {
            application.CertificationName =
                CleanString(
                    request.CertificationName
                );
        }

        if (
            request.CertificationNumber is not null
        )
        {
            application.CertificationNumber =
                CleanString(
                    request.CertificationNumber
                );
        }


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
        // TODO:
        // Upload to Cloudinary
        // =====================================================

        throw new NotImplementedException(
            "Use your existing Cloudinary upload implementation here."
        );
    }


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
    // 10 MB
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
    // CREATE DOCUMENT RECORD
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


    // =====================================================
    // SAVE
    // =====================================================

    _db.TrainerApplicationDocuments
        .Add(document);


    await _db.SaveChangesAsync();


    // =====================================================
    // RESPONSE
    // =====================================================

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
// ADMIN REVIEW APPLICATION
// =========================================================

public async Task ReviewAsync(
    Guid applicationId,
    Guid adminId,
    ReviewTrainerApplicationRequest request)
{
    var application =
        await _db.TrainerApplications
            .Include(x => x.User)
            .FirstOrDefaultAsync(
                x => x.Id == applicationId
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

        // Activate USER
        application.User.Status =
            UserStatus.Active;

        application.User.UpdatedAt =
            DateTime.UtcNow;


        // =================================================
        // ACTIVATE TRAINER PROFILE
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
            throw new InvalidOperationException(
                "Trainer profile was not found for this application."
            );
        }

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


        // Keep trainer profile inactive
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


        // Keep profile inactive
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