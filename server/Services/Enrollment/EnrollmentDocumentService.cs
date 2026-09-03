using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Enrollment;
using server.Enums;
using server.Interfaces.Enrollment;
using server.Services.Interfaces;

namespace server.Services.Enrollment;

public class EnrollmentDocumentService
    : IEnrollmentDocumentService
{
    private readonly ApplicationDbContext _context;
    private readonly ICloudinaryService _cloudinary;

    public EnrollmentDocumentService(
        ApplicationDbContext context,
        ICloudinaryService cloudinary)
    {
        _context = context;
        _cloudinary = cloudinary;
    }


    // =========================================================
    // UPLOAD ENROLLMENT DOCUMENT
    //
    // PARTICIPANT ONLY
    //
    // DocumentType is no longer used.
    //
    // The uploaded file is connected to the
    // TrainingProgramRequirement using RequirementId.
    // =========================================================

    public async Task<EnrollmentDocumentDto> UploadAsync(
        Guid enrollmentId,
        Guid participantUserId,
        UploadEnrollmentDocumentRequest request)
    {
        // -----------------------------------------------------
        // VALIDATE REQUEST
        // -----------------------------------------------------

        if (request is null)
        {
            throw new ArgumentNullException(
                nameof(request)
            );
        }

        if (request.File is null)
        {
            throw new ArgumentException(
                "Document file is required."
            );
        }

        if (request.File.Length == 0)
        {
            throw new ArgumentException(
                "The uploaded document is empty."
            );
        }


        // -----------------------------------------------------
        // FIND ENROLLMENT
        // -----------------------------------------------------

        var enrollment =
            await _context.Enrollments
                .Include(x =>
                    x.ParticipantProfile)
                .Include(x =>
                    x.TrainingBatch)
                    .ThenInclude(x =>
                        x.TrainingProgram)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        enrollmentId
                );

        if (enrollment is null)
        {
            throw new KeyNotFoundException(
                "Enrollment not found."
            );
        }


        // -----------------------------------------------------
        // VERIFY PARTICIPANT OWNERSHIP
        // -----------------------------------------------------

        if (
            enrollment
                .ParticipantProfile
                .UserId !=
            participantUserId
        )
        {
            throw new UnauthorizedAccessException(
                "You are not allowed to upload documents for this enrollment."
            );
        }


        // -----------------------------------------------------
        // FIND TRAINING PROGRAM REQUIREMENT
        // -----------------------------------------------------

        var requirement =
            await _context.TrainingProgramRequirements
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                            request.RequirementId &&
                        x.TrainingProgramId ==
                            enrollment
                                .TrainingBatch
                                .TrainingProgramId
                );

        if (requirement is null)
        {
            throw new ArgumentException(
                "The selected document requirement does not belong to this training program."
            );
        }


        // -----------------------------------------------------
        // CHECK DUPLICATE REQUIREMENT
        //
        // One uploaded document per requirement.
        // -----------------------------------------------------

        var existingDocument =
            await _context.EnrollmentDocuments
                .AnyAsync(
                    x =>
                        x.EnrollmentId ==
                            enrollmentId &&
                        x.RequirementId ==
                            request.RequirementId
                );

        if (existingDocument)
        {
            throw new InvalidOperationException(
                "A document for this requirement has already been uploaded."
            );
        }


        // -----------------------------------------------------
        // UPLOAD FILE TO CLOUDINARY
        // -----------------------------------------------------

        string fileUrl;

        await using (
            var stream =
                request.File.OpenReadStream()
        )
        {
            var uploadResult =
                await _cloudinary.UploadDocumentAsync(
                    stream,
                    request.File.FileName,
                    $"ace-nextgen/enrollments/{enrollmentId}"
                );

            fileUrl =
                uploadResult.Url;
        }


        // -----------------------------------------------------
        // CREATE ENROLLMENT DOCUMENT
        // -----------------------------------------------------

        var document =
            new server.Models.Participant.EnrollmentDocument
            {
                Id =
                    Guid.NewGuid(),

                EnrollmentId =
                    enrollmentId,

                RequirementId =
                    request.RequirementId,

                FileName =
                    request.File.FileName,

                FileUrl =
                    fileUrl,

                Status =
                    DocumentStatus.Pending,

                ReviewRemarks =
                    null,

                UploadedAt =
                    DateTime.UtcNow,

                ReviewedAt =
                    null
            };


        // -----------------------------------------------------
        // SAVE DATABASE RECORD
        // -----------------------------------------------------

        _context.EnrollmentDocuments.Add(
            document
        );

        await _context.SaveChangesAsync();


        // -----------------------------------------------------
        // RETURN DTO
        // -----------------------------------------------------

        return new EnrollmentDocumentDto(
            document.Id,
            document.RequirementId,
            requirement.Name,
            document.FileName,
            document.FileUrl,
            document.Status.ToString(),
            document.ReviewRemarks
        );
    }


    // =========================================================
    // GET DOCUMENTS BY ENROLLMENT
    //
    // PARTICIPANT ONLY
    // =========================================================

    public async Task<IEnumerable<EnrollmentDocumentDto>>
        GetByEnrollmentAsync(
            Guid enrollmentId,
            Guid userId)
    {
        // -----------------------------------------------------
        // FIND ENROLLMENT
        // -----------------------------------------------------

        var enrollment =
            await _context.Enrollments
                .Include(x =>
                    x.ParticipantProfile)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        enrollmentId
                );

        if (enrollment is null)
        {
            throw new KeyNotFoundException(
                "Enrollment not found."
            );
        }


        // -----------------------------------------------------
        // VERIFY OWNER
        // -----------------------------------------------------

        if (
            enrollment
                .ParticipantProfile
                .UserId !=
            userId
        )
        {
            throw new UnauthorizedAccessException(
                "You are not allowed to access these enrollment documents."
            );
        }


        // -----------------------------------------------------
        // GET DOCUMENTS
        // -----------------------------------------------------

        var documents =
            await _context.EnrollmentDocuments
                .AsNoTracking()
                .Include(x =>
                    x.Requirement)
                .Where(
                    x =>
                        x.EnrollmentId ==
                        enrollmentId
                )
                .OrderBy(
                    x =>
                        x.UploadedAt
                )
                .ToListAsync();


        // -----------------------------------------------------
        // RETURN DTOs
        // -----------------------------------------------------

        return documents.Select(
            document =>
                new EnrollmentDocumentDto(
                    document.Id,
                    document.RequirementId,
                    document.Requirement.Name,
                    document.FileName,
                    document.FileUrl,
                    document.Status.ToString(),
                    document.ReviewRemarks
                )
        );
    }


    // =========================================================
    // DELETE ENROLLMENT DOCUMENT
    //
    // PARTICIPANT ONLY
    // =========================================================

    public async Task DeleteAsync(
        Guid enrollmentId,
        Guid participantUserId,
        Guid documentId)
    {
        // -----------------------------------------------------
        // FIND ENROLLMENT
        // -----------------------------------------------------

        var enrollment =
            await _context.Enrollments
                .Include(x =>
                    x.ParticipantProfile)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        enrollmentId
                );

        if (enrollment is null)
        {
            throw new KeyNotFoundException(
                "Enrollment not found."
            );
        }


        // -----------------------------------------------------
        // VERIFY OWNER
        // -----------------------------------------------------

        if (
            enrollment
                .ParticipantProfile
                .UserId !=
            participantUserId
        )
        {
            throw new UnauthorizedAccessException(
                "You are not allowed to delete documents from this enrollment."
            );
        }


        // -----------------------------------------------------
        // FIND DOCUMENT
        // -----------------------------------------------------

        var document =
            await _context.EnrollmentDocuments
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                            documentId &&
                        x.EnrollmentId ==
                            enrollmentId
                );

        if (document is null)
        {
            throw new KeyNotFoundException(
                "Enrollment document not found."
            );
        }


        // -----------------------------------------------------
        // APPROVED DOCUMENTS CANNOT BE DELETED
        // -----------------------------------------------------

        if (
            document.Status ==
            DocumentStatus.Approved
        )
        {
            throw new InvalidOperationException(
                "Approved enrollment documents cannot be deleted."
            );
        }


        // -----------------------------------------------------
        // DELETE CLOUDINARY FILE
        // -----------------------------------------------------

        await _cloudinary.DeleteDocumentAsync(
            document.FileUrl
        );


        // -----------------------------------------------------
        // DELETE DATABASE RECORD
        // -----------------------------------------------------

        _context.EnrollmentDocuments.Remove(
            document
        );

        await _context.SaveChangesAsync();
    }


    // =========================================================
    // REVIEW ENROLLMENT DOCUMENT
    //
    // ADMIN ONLY
    // =========================================================

    public async Task ReviewAsync(
        Guid enrollmentId,
        Guid documentId,
        Guid adminUserId,
        ReviewEnrollmentDocumentRequest request)
    {
        // -----------------------------------------------------
        // VALIDATE REQUEST
        // -----------------------------------------------------

        if (request is null)
        {
            throw new ArgumentNullException(
                nameof(request)
            );
        }


        // -----------------------------------------------------
        // FIND DOCUMENT
        // -----------------------------------------------------

        var document =
            await _context.EnrollmentDocuments
                .Include(x =>
                    x.Enrollment)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                            documentId &&
                        x.EnrollmentId ==
                            enrollmentId
                );

        if (document is null)
        {
            throw new KeyNotFoundException(
                "Enrollment document not found."
            );
        }


        // -----------------------------------------------------
        // VALIDATE DECISION
        // -----------------------------------------------------

        var decision =
            request.Decision
                .Trim()
                .ToLowerInvariant();


        if (
            decision != "approved" &&
            decision != "rejected" &&
            decision != "needscorrection"
        )
        {
            throw new ArgumentException(
                "Invalid document review decision."
            );
        }


        // -----------------------------------------------------
        // APPLY DECISION
        // -----------------------------------------------------

        document.Status =
            decision switch
            {
                "approved" =>
                    DocumentStatus.Approved,

                "rejected" =>
                    DocumentStatus.Rejected,

                "needscorrection" =>
                    DocumentStatus.NeedsCorrection,

                _ =>
                    throw new ArgumentException(
                        "Invalid document review decision."
                    )
            };


        // -----------------------------------------------------
        // SAVE REVIEW REMARKS
        // -----------------------------------------------------

        document.ReviewRemarks =
            string.IsNullOrWhiteSpace(
                request.Remarks
            )
                ? null
                : request.Remarks.Trim();


        // -----------------------------------------------------
        // SAVE REVIEW DATE
        // -----------------------------------------------------

        document.ReviewedAt =
            DateTime.UtcNow;


        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<EnrollmentDocumentDto>>
    GetByEnrollmentForAdminAsync(Guid enrollmentId)
{
    var documents =
        await _context.EnrollmentDocuments
            .AsNoTracking()
            .Include(x => x.Requirement)
            .Where(x => x.EnrollmentId == enrollmentId)
            .OrderBy(x => x.RequirementId)
            .ToListAsync();

    return documents.Select(
        document =>
            new EnrollmentDocumentDto(
                document.Id,
                document.RequirementId,
                document.Requirement.Name,
                document.FileName,
                document.FileUrl,
                document.Status.ToString(),
                document.ReviewRemarks
            )
    );
}
}