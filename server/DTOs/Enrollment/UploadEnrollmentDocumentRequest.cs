using Microsoft.AspNetCore.Http;

namespace server.DTOs.Enrollment;

public record UploadEnrollmentDocumentRequest
{
    public Guid RequirementId { get; init; }

    public IFormFile File { get; init; } = default!;
}