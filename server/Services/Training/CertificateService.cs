
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Training;
using server.Enums;
using server.Interfaces;
using server.Models.Training;
using server.Services.Interfaces;

namespace server.Services.Training;

public class CertificateService : ICertificateService
{
    private readonly ApplicationDbContext _db;
    private readonly ITrainingGradeService _trainingGradeService;
    private readonly ICertificatePdfService _certificatePdfService;
    private readonly ICloudinaryService _cloudinaryService;
    private readonly ICacheService _cache;

    private const string CertificateCachePrefix = "certificates:";
    private static readonly TimeSpan CacheDuration =
        TimeSpan.FromMinutes(5);

    public CertificateService(
        ApplicationDbContext db,
        ITrainingGradeService trainingGradeService,
        ICertificatePdfService certificatePdfService,
        ICloudinaryService cloudinaryService,
        ICacheService cache)
    {
        _db = db;
        _trainingGradeService = trainingGradeService;
        _certificatePdfService = certificatePdfService;
        _cloudinaryService = cloudinaryService;
        _cache = cache;
    }

    // =========================================================
    // CACHE HELPERS
    // =========================================================

    private void InvalidateCertificateCache()
    {
        _cache.RemoveByPrefix(CertificateCachePrefix);
    }

    // =========================================================
    // GET CERTIFICATES BY ENROLLMENT
    // =========================================================

    public async Task<IReadOnlyList<CertificateDto>>
        GetByEnrollmentAsync(Guid enrollmentId)
    {
        var cacheKey =
            $"{CertificateCachePrefix}enrollment:{enrollmentId}";

        if (_cache.TryGet<List<CertificateDto>>(
                cacheKey,
                out var cachedCertificates) &&
            cachedCertificates is not null)
        {
            return cachedCertificates;
        }

        var certificates = await _db.Certificates
            .AsNoTracking()
            .Include(x => x.Enrollment)
                .ThenInclude(x => x.ParticipantProfile)
                    .ThenInclude(x => x.User)
            .Include(x => x.Enrollment)
                .ThenInclude(x => x.TrainingBatch)
                    .ThenInclude(x => x.TrainingProgram)
            .Where(x => x.EnrollmentId == enrollmentId)
            .OrderBy(x => x.Type)
            .ThenBy(x => x.IssuedAt)
            .ToListAsync();

        var result = certificates
            .Select(MapToDto)
            .ToList();

        _cache.Set(cacheKey, result, CacheDuration);

        return result;
    }

    // =========================================================
    // GET ALL CERTIFICATES
    // =========================================================

    public async Task<IReadOnlyList<CertificateDto>>
        GetAllAsync()
    {
        const string cacheKey =
            $"{CertificateCachePrefix}all";

        if (_cache.TryGet<List<CertificateDto>>(
                cacheKey,
                out var cachedCertificates) &&
            cachedCertificates is not null)
        {
            return cachedCertificates;
        }

        var certificates = await _db.Certificates
            .AsNoTracking()
            .Include(x => x.Enrollment)
                .ThenInclude(x => x.ParticipantProfile)
                    .ThenInclude(x => x.User)
            .Include(x => x.Enrollment)
                .ThenInclude(x => x.TrainingBatch)
                    .ThenInclude(x => x.TrainingProgram)
            .OrderByDescending(x => x.IssuedAt)
            .ToListAsync();

        var result = certificates
            .Select(MapToDto)
            .ToList();

        _cache.Set(cacheKey, result, CacheDuration);

        return result;
    }

 

    public async Task<CertificateDto?>
        GetByVerificationCodeAsync(string verificationCode)
    {
        if (string.IsNullOrWhiteSpace(verificationCode))
        {
            return null;
        }

        var normalizedCode = verificationCode.Trim();

        var cacheKey =
            $"{CertificateCachePrefix}verification:{normalizedCode}";

        if (_cache.TryGet<CertificateDto>(
                cacheKey,
                out var cachedCertificate) &&
            cachedCertificate is not null)
        {
            return cachedCertificate;
        }

        var certificate = await _db.Certificates
            .AsNoTracking()
            .Include(x => x.Enrollment)
                .ThenInclude(x => x.ParticipantProfile)
                    .ThenInclude(x => x.User)
            .Include(x => x.Enrollment)
                .ThenInclude(x => x.TrainingBatch)
                    .ThenInclude(x => x.TrainingProgram)
            .FirstOrDefaultAsync(x =>
                x.VerificationCode == normalizedCode);

        if (certificate is null)
        {
            return null;
        }

        var result = MapToDto(certificate);

        _cache.Set(cacheKey, result, CacheDuration);

        return result;
    }

    // =========================================================
    // GENERATE CERTIFICATES FOR ENROLLMENT
    // =========================================================

    public async Task<IReadOnlyList<CertificateDto>>
        GenerateForEnrollmentAsync(Guid enrollmentId)
    {
        // 1. Get enrollment and related information.

        var enrollment = await _db.Enrollments
            .Include(x => x.ParticipantProfile)
                .ThenInclude(x => x.User)
            .Include(x => x.TrainingBatch)
                .ThenInclude(x => x.TrainingProgram)
            .FirstOrDefaultAsync(x => x.Id == enrollmentId);

        if (enrollment is null)
        {
            throw new InvalidOperationException(
                "Enrollment not found.");
        }

        // 2. Enrollment must be approved.

        if (enrollment.Status != EnrollmentStatus.Approved)
        {
            throw new InvalidOperationException(
                "Certificates can only be generated for approved enrollments.");
        }

        // 3. Validate related data.

        if (enrollment.ParticipantProfile is null)
        {
            throw new InvalidOperationException(
                "Participant profile was not found.");
        }

        if (enrollment.ParticipantProfile.User is null)
        {
            throw new InvalidOperationException(
                "Participant user information was not found.");
        }

        if (enrollment.TrainingBatch is null)
        {
            throw new InvalidOperationException(
                "Training batch was not found.");
        }

        if (enrollment.TrainingBatch.TrainingProgram is null)
        {
            throw new InvalidOperationException(
                "Training program was not found.");
        }

        // 4. Get training grade.

        var grade = await _trainingGradeService
            .GetByEnrollmentAsync(enrollmentId);

        if (grade is null)
        {
            throw new InvalidOperationException(
                "Training grade is not available yet.");
        }

        // 5. Get training information.

        var participantName =
            enrollment.ParticipantProfile.User.FullName;

        var trainingName =
            enrollment.TrainingBatch.TrainingProgram.Name;

        var batchCode =
            enrollment.TrainingBatch.BatchCode;

        if (string.IsNullOrWhiteSpace(participantName))
        {
            throw new InvalidOperationException(
                "Participant name is missing.");
        }

        if (string.IsNullOrWhiteSpace(trainingName))
        {
            throw new InvalidOperationException(
                "Training program name is missing.");
        }

        if (string.IsNullOrWhiteSpace(batchCode))
        {
            throw new InvalidOperationException(
                "Training batch code is missing.");
        }

        // 6. Get existing certificates.

        var existingCertificates = await _db.Certificates
            .Where(x => x.EnrollmentId == enrollmentId)
            .ToListAsync();

        var participationCertificate =
            existingCertificates.FirstOrDefault(x =>
                x.Type == CertificateType.Participation);

        var completionCertificate =
            existingCertificates.FirstOrDefault(x =>
                x.Type == CertificateType.Completion);

        // 7. Generate participation certificate if missing.

        if (participationCertificate is null)
        {
            participationCertificate = new Certificate
            {
                Id = Guid.NewGuid(),
                EnrollmentId = enrollmentId,
                CertificateNumber =
                    await GenerateUniqueCertificateNumberAsync(),
                Type = CertificateType.Participation,
                IssuedAt = DateTime.UtcNow,
                VerificationCode =
                    await GenerateUniqueVerificationCodeAsync(),
                IsRevoked = false
            };

            _db.Certificates.Add(participationCertificate);

            await _db.SaveChangesAsync();

            InvalidateCertificateCache();
        }

        // 8. Generate participation PDF if missing.

        if (string.IsNullOrWhiteSpace(
                participationCertificate.PdfUrl))
        {
            await GenerateCertificatePdfAsync(
                participationCertificate,
                participantName,
                trainingName,
                batchCode);
        }

        // 9. Generate completion certificate only if passed.

        if (grade.IsPassed)
        {
            if (completionCertificate is null)
            {
                completionCertificate = new Certificate
                {
                    Id = Guid.NewGuid(),
                    EnrollmentId = enrollmentId,
                    CertificateNumber =
                        await GenerateUniqueCertificateNumberAsync(),
                    Type = CertificateType.Completion,
                    IssuedAt = DateTime.UtcNow,
                    VerificationCode =
                        await GenerateUniqueVerificationCodeAsync(),
                    IsRevoked = false
                };

                _db.Certificates.Add(completionCertificate);

                await _db.SaveChangesAsync();

                InvalidateCertificateCache();
            }

            // 10. Generate completion PDF if missing.

            if (string.IsNullOrWhiteSpace(
                    completionCertificate.PdfUrl))
            {
                await GenerateCertificatePdfAsync(
                    completionCertificate,
                    participantName,
                    trainingName,
                    batchCode);
            }
        }

        // 11. Return fresh certificate data.
        // Invalidation has occurred after certificate writes.

        return await GetByEnrollmentAsync(enrollmentId);
    }

    // =========================================================
    // GENERATE PDF AND UPLOAD TO CLOUDINARY
    // =========================================================

    private async Task GenerateCertificatePdfAsync(
        Certificate certificate,
        string participantName,
        string trainingName,
        string batchCode)
    {
        await using var pdfStream =
            await _certificatePdfService.GenerateAsync(
                participantName,
                trainingName,
                batchCode,
                certificate.CertificateNumber,
                certificate.IssuedAt,
                certificate.VerificationCode,
                certificate.Type.ToString());

        if (pdfStream is null)
        {
            throw new InvalidOperationException(
                "Certificate PDF stream could not be generated.");
        }

        if (pdfStream.Length == 0)
        {
            throw new InvalidOperationException(
                "Certificate PDF is empty.");
        }

        pdfStream.Position = 0;

        var fileName =
            $"{certificate.CertificateNumber}.pdf";

        var uploadResult = await _cloudinaryService
            .UploadCertificatePdfAsync(
                pdfStream,
                fileName,
                "anci/certificates");

        if (string.IsNullOrWhiteSpace(uploadResult.Url))
        {
            throw new InvalidOperationException(
                "Cloudinary did not return a certificate PDF URL.");
        }

        certificate.PdfUrl = uploadResult.Url;

        await _db.SaveChangesAsync();

        InvalidateCertificateCache();
    }

    // =========================================================
    // GET ELIGIBLE CERTIFICATES
    // =========================================================

    public async Task<IReadOnlyList<EligibleCertificateDto>>
        GetEligibleAsync()
    {
        const string cacheKey =
            $"{CertificateCachePrefix}eligible";

        if (_cache.TryGet<List<EligibleCertificateDto>>(
                cacheKey,
                out var cachedEligible) &&
            cachedEligible is not null)
        {
            return cachedEligible;
        }

        var enrollments = await _db.Enrollments
            .AsNoTracking()
            .Include(x => x.ParticipantProfile)
                .ThenInclude(x => x.User)
            .Include(x => x.TrainingBatch)
                .ThenInclude(x => x.TrainingProgram)
            .Where(x => x.Status == EnrollmentStatus.Approved)
            .OrderBy(x => x.TrainingBatch.BatchCode)
            .ThenBy(x => x.ParticipantProfile.User.FullName)
            .ToListAsync();

        var result = new List<EligibleCertificateDto>();

        foreach (var enrollment in enrollments)
        {
            var grade = await _trainingGradeService
                .GetByEnrollmentAsync(enrollment.Id);

            if (grade is null)
            {
                continue;
            }

            var existingCertificates = await _db.Certificates
                .AsNoTracking()
                .Where(x => x.EnrollmentId == enrollment.Id)
                .Select(x => x.Type)
                .ToListAsync();

            var hasParticipation =
                existingCertificates.Contains(
                    CertificateType.Participation);

            var hasCompletion =
                existingCertificates.Contains(
                    CertificateType.Completion);

            result.Add(new EligibleCertificateDto
            {
                EnrollmentId = enrollment.Id,
                TrainingBatchId = enrollment.TrainingBatchId,

                ParticipantName =
                    enrollment.ParticipantProfile.User.FullName,

                TrainingName =
                    enrollment.TrainingBatch.TrainingProgram.Name,

                BatchCode =
                    enrollment.TrainingBatch.BatchCode,

                OverallGrade = grade.OverallGrade,
                IsPassed = grade.IsPassed,

                HasParticipationCertificate = hasParticipation,
                HasCompletionCertificate = hasCompletion
            });
        }

        _cache.Set(cacheKey, result, CacheDuration);

        return result;
    }

    // =========================================================
    // MAP ENTITY TO DTO
    // =========================================================

    private static CertificateDto MapToDto(
        Certificate certificate)
    {
        return new CertificateDto
        {
            Id = certificate.Id,
            EnrollmentId = certificate.EnrollmentId,
            CertificateNumber = certificate.CertificateNumber,
            Type = certificate.Type.ToString(),
            IssuedAt = certificate.IssuedAt,
            VerificationCode = certificate.VerificationCode,
            PdfUrl = certificate.PdfUrl,

            CanvaDesignId = certificate.CanvaDesignId,

            IsRevoked = certificate.IsRevoked,
            RevocationReason = certificate.RevocationReason,

            ParticipantName =
                certificate.Enrollment?
                    .ParticipantProfile?
                    .User?
                    .FullName,

            TrainingName =
                certificate.Enrollment?
                    .TrainingBatch?
                    .TrainingProgram?
                    .Name,

            BatchCode =
                certificate.Enrollment?
                    .TrainingBatch?
                    .BatchCode
        };
    }

    // =========================================================
    // GENERATE UNIQUE CERTIFICATE NUMBER
    // =========================================================

    private async Task<string>
        GenerateUniqueCertificateNumberAsync()
    {
        const int maxAttempts = 20;

        for (var attempt = 0;
             attempt < maxAttempts;
             attempt++)
        {
            var number =
                $"ANCI-CERT-{DateTime.UtcNow:yyyy}-{RandomDigits(6)}";

            var exists = await _db.Certificates
                .AnyAsync(x => x.CertificateNumber == number);

            if (!exists)
            {
                return number;
            }
        }

        throw new InvalidOperationException(
            "Unable to generate a unique certificate number.");
    }

    // =========================================================
    // GENERATE UNIQUE VERIFICATION CODE
    // =========================================================

    private async Task<string>
        GenerateUniqueVerificationCodeAsync()
    {
        const int maxAttempts = 20;

        for (var attempt = 0;
             attempt < maxAttempts;
             attempt++)
        {
            var code = $"ANCI-{RandomAlphaNumeric(8)}";

            var exists = await _db.Certificates
                .AnyAsync(x => x.VerificationCode == code);

            if (!exists)
            {
                return code;
            }
        }

        throw new InvalidOperationException(
            "Unable to generate a unique verification code.");
    }

    // =========================================================
    // RANDOM DIGITS
    // =========================================================

    private static string RandomDigits(int length)
    {
        var random = Random.Shared;
        var chars = new char[length];

        for (var i = 0; i < length; i++)
        {
            chars[i] = (char)('0' + random.Next(0, 10));
        }

        return new string(chars);
    }

    // =========================================================
    // RANDOM ALPHANUMERIC
    // =========================================================

    private static string RandomAlphaNumeric(int length)
    {
        const string chars =
            "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

        var random = Random.Shared;
        var result = new char[length];

        for (var i = 0; i < length; i++)
        {
            result[i] = chars[random.Next(chars.Length)];
        }

        return new string(result);
    }

    // =========================================================
    // GET CERTIFICATES FOR AUTHENTICATED PARTICIPANT
    // =========================================================

    public async Task<IReadOnlyList<CertificateDto>>
        GetMyCertificatesAsync(Guid userId)
    {
        var cacheKey =
            $"{CertificateCachePrefix}user:{userId}";

        if (_cache.TryGet<List<CertificateDto>>(
                cacheKey,
                out var cachedCertificates) &&
            cachedCertificates is not null)
        {
            return cachedCertificates;
        }

        var certificates = await _db.Certificates
            .AsNoTracking()
            .Include(x => x.Enrollment)
                .ThenInclude(x => x.ParticipantProfile)
                    .ThenInclude(x => x.User)
            .Include(x => x.Enrollment)
                .ThenInclude(x => x.TrainingBatch)
                    .ThenInclude(x => x.TrainingProgram)
            .Where(x =>
                x.Enrollment.ParticipantProfile.UserId == userId)
            .OrderByDescending(x => x.IssuedAt)
            .ToListAsync();

        var result = certificates
            .Select(MapToDto)
            .ToList();

        _cache.Set(cacheKey, result, CacheDuration);

        return result;
    }
}
