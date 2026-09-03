using server.DTOs.Enrollment;

namespace server.Interfaces.Enrollment;

public interface IEnrollmentDocumentService
{
    // =========================================================
    // UPLOAD ENROLLMENT DOCUMENT
    // =========================================================

    Task<EnrollmentDocumentDto> UploadAsync(
        Guid enrollmentId,
        Guid participantUserId,
        UploadEnrollmentDocumentRequest request
    );


    // =========================================================
    // GET DOCUMENTS BY ENROLLMENT
    // =========================================================

    Task<IEnumerable<EnrollmentDocumentDto>>
        GetByEnrollmentAsync(
            Guid enrollmentId,
            Guid userId
        );


    // =========================================================
    // DELETE ENROLLMENT DOCUMENT
    // =========================================================

    Task DeleteAsync(
        Guid enrollmentId,
        Guid participantUserId,
        Guid documentId
    );


    // =========================================================
    // REVIEW ENROLLMENT DOCUMENT
    // =========================================================

    Task ReviewAsync(
        Guid enrollmentId,
        Guid documentId,
        Guid adminUserId,
        ReviewEnrollmentDocumentRequest request
    );

    Task<IEnumerable<EnrollmentDocumentDto>>
    GetByEnrollmentForAdminAsync(
        Guid enrollmentId
    );
}