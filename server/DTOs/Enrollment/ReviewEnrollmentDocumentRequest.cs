namespace server.DTOs.Enrollment;

public record ReviewEnrollmentDocumentRequest(
    string Decision,
    string? Remarks
);