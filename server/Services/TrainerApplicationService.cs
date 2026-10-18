
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Trainer;
using server.Enums;
using server.Interfaces;
using server.Models.Trainer;
using server.Services.Interfaces;

namespace server.Services;

public class TrainerApplicationService : ITrainerApplicationService
{
    private readonly ApplicationDbContext _db;
    private readonly ICloudinaryService _cloudinaryService;
    private readonly ICacheService _cacheService;

    private const string AllApplicationsCacheKey =
        "trainer:applications:all";

    private static readonly TimeSpan CacheExpiration =
        TimeSpan.FromMinutes(5);

    private static string GetMyApplicationCacheKey(Guid userId)
        => $"trainer:application:user:{userId}";

    private static string GetApplicationByIdCacheKey(Guid id)
        => $"trainer:application:id:{id}";

    public TrainerApplicationService(
        ApplicationDbContext db,
        ICloudinaryService cloudinaryService,
        ICacheService cacheService)
    {
        _db = db;
        _cloudinaryService = cloudinaryService;
        _cacheService = cacheService;
    }

    // =========================================================
    // CACHE INVALIDATION
    // =========================================================

    private void InvalidateApplicationCaches(
        Guid userId,
        Guid? applicationId = null)
    {
        _cacheService.Remove(AllApplicationsCacheKey);
        _cacheService.Remove(GetMyApplicationCacheKey(userId));

        if (applicationId.HasValue)
        {
            _cacheService.Remove(
                GetApplicationByIdCacheKey(applicationId.Value));
        }
    }

    private void InvalidateTrainerProfileCaches(
        Guid userId,
        Guid? trainerProfileId = null)
    {
        _cacheService.Remove($"trainer:profile:user:{userId}");
        _cacheService.Remove("trainer:profiles:active");

        if (trainerProfileId.HasValue)
        {
            _cacheService.Remove(
                $"trainer:profile:id:{trainerProfileId.Value}");
        }
    }

    // =========================================================
    // GET MY APPLICATION
    // =========================================================

    public async Task<TrainerApplicationDto?> GetMyApplicationAsync(
        Guid userId)
    {
        var cacheKey = GetMyApplicationCacheKey(userId);

        if (_cacheService.TryGet<TrainerApplicationDto>(
                cacheKey, out var cached))
        {
            return cached;
        }

        var application = await _db.TrainerApplications
            .AsNoTracking()
            .AsSplitQuery()
            .Include(x => x.User)
            .Include(x => x.Educations)
            .Include(x => x.Certifications)
            .Include(x => x.Documents)
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (application is null)
        {
            return null;
        }

        var result = MapApplication(application);

        _cacheService.Set(
            cacheKey,
            result,
            CacheExpiration);

        return result;
    }

    // =========================================================
    // ADMIN: GET ALL APPLICATIONS
    // =========================================================

    public async Task<List<TrainerApplicationDto>> GetAllAsync()
    {
        if (_cacheService.TryGet<List<TrainerApplicationDto>>(
                AllApplicationsCacheKey, out var cached))
        {
            return cached!;
        }

        var applications = await _db.TrainerApplications
            .AsNoTracking()
            .AsSplitQuery()
            .Include(x => x.User)
            .Include(x => x.Educations)
            .Include(x => x.Certifications)
            .Include(x => x.Documents)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        var result = applications
            .Select(MapApplication)
            .ToList();

        _cacheService.Set(
            AllApplicationsCacheKey,
            result,
            CacheExpiration);

        return result;
    }

    // =========================================================
    // GET APPLICATION BY ID
    // =========================================================

    public async Task<TrainerApplicationDto?> GetByIdAsync(Guid id)
    {
        var cacheKey = GetApplicationByIdCacheKey(id);

        if (_cacheService.TryGet<TrainerApplicationDto>(
                cacheKey, out var cached))
        {
            return cached;
        }

        var application = await _db.TrainerApplications
            .AsNoTracking()
            .AsSplitQuery()
            .Include(x => x.User)
            .Include(x => x.Educations)
            .Include(x => x.Certifications)
            .Include(x => x.Documents)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (application is null)
        {
            return null;
        }

        var result = MapApplication(application);

        _cacheService.Set(
            cacheKey,
            result,
            CacheExpiration);

        return result;
    }

    // =========================================================
    // UPDATE MY APPLICATION
    // =========================================================

    public async Task<TrainerApplicationDto?> UpdateMyApplicationAsync(
        Guid userId,
        UpdateTrainerApplicationRequest request)
    {
        var application = await _db.TrainerApplications
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (application is null)
        {
            return null;
        }

        if (application.Status != TrainerApplicationStatus.Pending &&
            application.Status != TrainerApplicationStatus.NeedsCorrection)
        {
            throw new InvalidOperationException(
                "This application can no longer be edited.");
        }

        if (request.FirstName is not null)
            application.FirstName = CleanString(request.FirstName);

        if (request.MiddleName is not null)
            application.MiddleName = CleanString(request.MiddleName);

        if (request.LastName is not null)
            application.LastName = CleanString(request.LastName);

        if (request.Suffix is not null)
            application.Suffix = CleanString(request.Suffix);

        if (request.BirthDate.HasValue)
            application.BirthDate = request.BirthDate;

        if (request.Gender is not null)
            application.Gender = CleanString(request.Gender);

        if (request.Address is not null)
            application.Address = CleanString(request.Address);

        if (request.Specialization is not null)
        {
            var specialization = request.Specialization.Trim();

            if (string.IsNullOrWhiteSpace(specialization))
            {
                throw new InvalidOperationException(
                    "Specialization is required.");
            }

            application.Specialization = specialization;
        }

        if (request.ProfessionalTitle is not null)
            application.ProfessionalTitle =
                CleanString(request.ProfessionalTitle);

        if (request.CurrentOrganization is not null)
            application.CurrentOrganization =
                CleanString(request.CurrentOrganization);

        if (request.Bio is not null)
            application.Bio = CleanString(request.Bio);

        if (request.YearsOfExperience.HasValue)
        {
            if (request.YearsOfExperience.Value < 0 ||
                request.YearsOfExperience.Value > 100)
            {
                throw new InvalidOperationException(
                    "Years of experience must be between 0 and 100.");
            }

            application.YearsOfExperience =
                request.YearsOfExperience;
        }

        if (request.ProfessionalLicenseNumber is not null)
            application.ProfessionalLicenseNumber =
                CleanString(request.ProfessionalLicenseNumber);

        if (request.ProfessionalLicenseType is not null)
            application.ProfessionalLicenseType =
                CleanString(request.ProfessionalLicenseType);

        if (request.ProfessionalLicenseExpirationDate.HasValue)
        {
            application.ProfessionalLicenseExpirationDate =
                request.ProfessionalLicenseExpirationDate;
        }

        var nameParts = new[]
            {
                application.FirstName,
                application.MiddleName,
                application.LastName,
                application.Suffix
            }
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Select(x => x!.Trim());

        application.User.FullName = string.Join(" ", nameParts);
        application.User.UpdatedAt = DateTime.UtcNow;

        if (application.Status ==
            TrainerApplicationStatus.NeedsCorrection)
        {
            application.Status = TrainerApplicationStatus.Pending;
            application.SubmittedAt = DateTime.UtcNow;
            application.AdminRemarks = null;
        }

        await _db.SaveChangesAsync();

        InvalidateApplicationCaches(userId, application.Id);

        return await GetMyApplicationAsync(userId);
    }

    // =========================================================
    // UPDATE PROFILE IMAGE
    // =========================================================

    public async Task<TrainerApplicationDto?> UpdateProfileImageAsync(
        Guid userId,
        IFormFile profileImage)
    {
        var application = await _db.TrainerApplications
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (application is null)
            return null;

        if (application.Status != TrainerApplicationStatus.Pending &&
            application.Status != TrainerApplicationStatus.NeedsCorrection)
        {
            throw new InvalidOperationException(
                "This application can no longer be modified.");
        }

        if (profileImage is null || profileImage.Length == 0)
        {
            throw new InvalidOperationException(
                "Profile image is required.");
        }

        const long maxFileSize = 5 * 1024 * 1024;

        if (profileImage.Length > maxFileSize)
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

        var contentType = profileImage.ContentType.ToLowerInvariant();

        if (!allowedContentTypes.Contains(contentType))
        {
            throw new InvalidOperationException(
                "Only JPG, PNG, and WEBP images are allowed.");
        }

        await using var stream = profileImage.OpenReadStream();

        var fileUrl = await _cloudinaryService.UploadImageAsync(
            stream,
            profileImage.FileName,
            "ace-nextgen/trainer-applications/profile");

        if (string.IsNullOrWhiteSpace(fileUrl))
        {
            throw new InvalidOperationException(
                "Profile image upload failed.");
        }

        application.ProfileImageUrl = fileUrl;

        await _db.SaveChangesAsync();

        InvalidateApplicationCaches(userId, application.Id);

        return await GetMyApplicationAsync(userId);
    }

    // =========================================================
    // UPLOAD DOCUMENT
    // =========================================================

    public async Task<TrainerApplicationDocumentDto> UploadDocumentAsync(
        Guid userId,
        Guid applicationId,
        UploadTrainerApplicationDocumentRequest request)
    {
        var application = await _db.TrainerApplications
            .FirstOrDefaultAsync(
                x => x.Id == applicationId && x.UserId == userId);

        if (application is null)
        {
            throw new KeyNotFoundException(
                "Trainer application was not found.");
        }

        if (application.Status != TrainerApplicationStatus.Pending &&
            application.Status != TrainerApplicationStatus.NeedsCorrection)
        {
            throw new InvalidOperationException(
                "This trainer application can no longer be modified.");
        }

        if (request.File is null)
        {
            throw new InvalidOperationException(
                "Document file is required.");
        }

        if (request.File.Length <= 0)
        {
            throw new InvalidOperationException(
                "Document file is empty.");
        }

        const long maxFileSize = 10 * 1024 * 1024;

        if (request.File.Length > maxFileSize)
        {
            throw new InvalidOperationException(
                "Document must not exceed 10 MB.");
        }

        var documentType = request.DocumentType?.Trim();

        if (string.IsNullOrWhiteSpace(documentType))
        {
            throw new InvalidOperationException(
                "Document type is required.");
        }

        var allowedContentTypes = new[]
        {
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp"
        };

        var contentType = request.File.ContentType.ToLowerInvariant();

        if (!allowedContentTypes.Contains(contentType))
        {
            throw new InvalidOperationException(
                "Only PDF, JPG, PNG, and WEBP files are allowed.");
        }

        await using var stream = request.File.OpenReadStream();

        var fileUrl = await _cloudinaryService.UploadImageAsync(
            stream,
            request.File.FileName,
            "ace-nextgen/trainer-applications/documents");

        if (string.IsNullOrWhiteSpace(fileUrl))
        {
            throw new InvalidOperationException(
                "Document upload failed.");
        }

        var document = new TrainerApplicationDocument
        {
            Id = Guid.NewGuid(),
            TrainerApplicationId = application.Id,
            DocumentType = documentType,
            FileName = request.File.FileName,
            FileUrl = fileUrl,
            Status = DocumentStatus.Pending,
            ReviewRemarks = null,
            ReviewedByUserId = null,
            ReviewedAt = null,
            UploadedAt = DateTime.UtcNow
        };

        _db.TrainerApplicationDocuments.Add(document);

        await _db.SaveChangesAsync();

        InvalidateApplicationCaches(userId, application.Id);

        return new TrainerApplicationDocumentDto(
            document.Id,
            document.DocumentType,
            document.FileName,
            document.FileUrl,
            document.Status.ToString(),
            document.ReviewRemarks);
    }

    // =========================================================
    // GET MY DOCUMENTS
    // =========================================================

    public async Task<List<TrainerApplicationDocumentDto>> GetMyDocumentsAsync(
        Guid userId,
        Guid applicationId)
    {
        var ownsApplication = await _db.TrainerApplications
            .AnyAsync(x => x.Id == applicationId && x.UserId == userId);

        if (!ownsApplication)
        {
            throw new KeyNotFoundException(
                "Trainer application was not found.");
        }

        return await _db.TrainerApplicationDocuments
            .AsNoTracking()
            .Where(x => x.TrainerApplicationId == applicationId)
            .OrderByDescending(x => x.UploadedAt)
            .Select(x => new TrainerApplicationDocumentDto(
                x.Id,
                x.DocumentType,
                x.FileName,
                x.FileUrl,
                x.Status.ToString(),
                x.ReviewRemarks))
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
        var document = await _db.TrainerApplicationDocuments
            .Include(x => x.TrainerApplication)
            .FirstOrDefaultAsync(
                x => x.Id == documentId &&
                     x.TrainerApplicationId == applicationId &&
                     x.TrainerApplication.UserId == userId);

        if (document is null)
        {
            throw new KeyNotFoundException(
                "Document was not found.");
        }

        if (document.Status == DocumentStatus.Approved)
        {
            throw new InvalidOperationException(
                "Approved documents cannot be deleted.");
        }

        _db.TrainerApplicationDocuments.Remove(document);

        await _db.SaveChangesAsync();

        InvalidateApplicationCaches(userId, applicationId);
    }

    // =========================================================
    // ADMIN: REVIEW APPLICATION
    // =========================================================

    public async Task ReviewAsync(
        Guid applicationId,
        Guid adminId,
        ReviewTrainerApplicationRequest request)
    {
        var application = await _db.TrainerApplications
            .Include(x => x.User)
            .Include(x => x.Educations)
            .Include(x => x.Certifications)
            .FirstOrDefaultAsync(x => x.Id == applicationId);

        if (application is null)
        {
            throw new KeyNotFoundException(
                "Trainer application was not found.");
        }

        var decision = request.Decision.Trim();

        if (string.Equals(
                decision, "Approved",
                StringComparison.OrdinalIgnoreCase))
        {
            var trainerProfile = await _db.TrainerProfiles
                .FirstOrDefaultAsync(x => x.UserId == application.UserId);

            if (trainerProfile is null)
            {
                throw new InvalidOperationException(
                    "Trainer profile was not found for this application.");
            }

            trainerProfile.FirstName = application.FirstName;
            trainerProfile.MiddleName = application.MiddleName;
            trainerProfile.LastName = application.LastName;
            trainerProfile.Suffix = application.Suffix;
            trainerProfile.BirthDate = application.BirthDate;
            trainerProfile.Gender = application.Gender;
            trainerProfile.Address = application.Address;
            trainerProfile.MobileNumber = application.User.MobileNumber;

            trainerProfile.Specialization = application.Specialization;
            trainerProfile.ProfessionalTitle = application.ProfessionalTitle;
            trainerProfile.CurrentOrganization = application.CurrentOrganization;
            trainerProfile.Bio = application.Bio;
            trainerProfile.YearsOfExperience = application.YearsOfExperience;

            trainerProfile.ProfessionalLicenseNumber =
                application.ProfessionalLicenseNumber;

            trainerProfile.ProfessionalLicenseType =
                application.ProfessionalLicenseType;

            trainerProfile.ProfessionalLicenseExpirationDate =
                application.ProfessionalLicenseExpirationDate;

            trainerProfile.ProfileImageUrl = application.ProfileImageUrl;

            var existingEducations = await _db.TrainerEducations
                .Where(x => x.TrainerProfileId == trainerProfile.Id)
                .ToListAsync();

            if (existingEducations.Count > 0)
            {
                _db.TrainerEducations.RemoveRange(existingEducations);
            }

            foreach (var education in application.Educations)
            {
                _db.TrainerEducations.Add(new TrainerEducation
                {
                    Id = Guid.NewGuid(),
                    TrainerProfileId = trainerProfile.Id,
                    Degree = education.Degree,
                    FieldOfStudy = education.FieldOfStudy,
                    Institution = education.Institution,
                    YearGraduated = education.YearGraduated
                });
            }

            var existingCertifications = await _db.TrainerCertifications
                .Where(x => x.TrainerProfileId == trainerProfile.Id)
                .ToListAsync();

            if (existingCertifications.Count > 0)
            {
                _db.TrainerCertifications.RemoveRange(
                    existingCertifications);
            }

            foreach (var certification in application.Certifications)
            {
                _db.TrainerCertifications.Add(new TrainerCertification
                {
                    Id = Guid.NewGuid(),
                    TrainerProfileId = trainerProfile.Id,
                    Name = certification.Name,
                    IssuingOrganization = certification.IssuingOrganization,
                    IssuedDate = certification.IssuedDate,
                    ExpirationDate = certification.ExpirationDate,
                    CertificateUrl = certification.CertificateUrl
                });
            }

            trainerProfile.IsActive = true;
            trainerProfile.ActivatedAt = DateTime.UtcNow;

            application.User.Status = UserStatus.Active;
            application.User.UpdatedAt = DateTime.UtcNow;

            application.Status = TrainerApplicationStatus.Approved;

            // Used below to invalidate trainer-profile caches.
            _reviewedTrainerProfileId = trainerProfile.Id;
        }
        else if (string.Equals(
                     decision, "Rejected",
                     StringComparison.OrdinalIgnoreCase))
        {
            application.Status = TrainerApplicationStatus.Rejected;
            application.User.Status = UserStatus.Rejected;
            application.User.UpdatedAt = DateTime.UtcNow;

            var trainerProfile = await _db.TrainerProfiles
                .FirstOrDefaultAsync(x => x.UserId == application.UserId);

            if (trainerProfile is not null)
            {
                trainerProfile.IsActive = false;
                trainerProfile.ActivatedAt = null;
                _reviewedTrainerProfileId = trainerProfile.Id;
            }
        }
        else if (string.Equals(
                     decision, "NeedsCorrection",
                     StringComparison.OrdinalIgnoreCase))
        {
            application.Status = TrainerApplicationStatus.NeedsCorrection;
            application.User.Status = UserStatus.Pending;
            application.User.UpdatedAt = DateTime.UtcNow;

            var trainerProfile = await _db.TrainerProfiles
                .FirstOrDefaultAsync(x => x.UserId == application.UserId);

            if (trainerProfile is not null)
            {
                trainerProfile.IsActive = false;
                trainerProfile.ActivatedAt = null;
                _reviewedTrainerProfileId = trainerProfile.Id;
            }
        }
        else
        {
            throw new InvalidOperationException(
                "Invalid review decision.");
        }

        application.AdminRemarks = CleanString(request.Remarks);
        application.ReviewedByUserId = adminId;
        application.ReviewedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        InvalidateApplicationCaches(
            application.UserId,
            application.Id);

        InvalidateTrainerProfileCaches(
            application.UserId,
            _reviewedTrainerProfileId);

        _reviewedTrainerProfileId = null;
    }

    // Temporary holder for the profile changed during ReviewAsync.
    private Guid? _reviewedTrainerProfileId;

    // =========================================================
    // ADMIN: REVIEW DOCUMENT
    // =========================================================

    public async Task ReviewDocumentAsync(
        Guid applicationId,
        Guid documentId,
        Guid adminId,
        ReviewTrainerApplicationDocumentRequest request)
    {
        var document = await _db.TrainerApplicationDocuments
            .Include(x => x.TrainerApplication)
            .FirstOrDefaultAsync(
                x => x.Id == documentId &&
                     x.TrainerApplicationId == applicationId);

        if (document is null)
        {
            throw new KeyNotFoundException(
                "Trainer application document was not found.");
        }

        document.Status = request.Status;
        document.ReviewRemarks = CleanString(request.ReviewRemarks);
        document.ReviewedByUserId = adminId;
        document.ReviewedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        InvalidateApplicationCaches(
            document.TrainerApplication.UserId,
            applicationId);
    }

    // =========================================================
    // MAP ENTITY TO DTO
    // =========================================================

    private static TrainerApplicationDto MapApplication(
        TrainerApplication x)
    {
        return new TrainerApplicationDto(
            x.Id,
            x.UserId,

            x.User?.UserCode ?? string.Empty,
            x.User?.FullName ?? string.Empty,
            x.User?.Email ?? string.Empty,
            x.User?.MobileNumber,

            x.FirstName,
            x.MiddleName,
            x.LastName,
            x.Suffix,
            x.BirthDate,
            x.Gender,
            x.Address,

            x.Specialization,
            x.ProfessionalTitle,
            x.CurrentOrganization,
            x.Bio,
            x.YearsOfExperience,

            x.ProfessionalLicenseNumber,
            x.ProfessionalLicenseType,
            x.ProfessionalLicenseExpirationDate,

            x.ProfileImageUrl,

            x.Status.ToString(),
            x.AdminRemarks,

            x.CreatedAt,
            x.SubmittedAt,

            x.Educations?
                .Select(education =>
                    new TrainerApplicationEducationDto(
                        education.Id,
                        education.Degree,
                        education.FieldOfStudy,
                        education.Institution,
                        education.YearGraduated))
                .ToList()
                ?? new List<TrainerApplicationEducationDto>(),

            x.Certifications?
                .Select(certification =>
                    new TrainerApplicationCertificationDto(
                        certification.Id,
                        certification.Name,
                        certification.IssuingOrganization,
                        certification.IssuedDate,
                        certification.ExpirationDate,
                        certification.CertificateUrl))
                .ToList()
                ?? new List<TrainerApplicationCertificationDto>(),

            x.Documents?
                .Select(document =>
                    new TrainerApplicationDocumentDto(
                        document.Id,
                        document.DocumentType,
                        document.FileName,
                        document.FileUrl,
                        document.Status.ToString(),
                        document.ReviewRemarks))
                .ToList()
                ?? new List<TrainerApplicationDocumentDto>()
        );
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
}
