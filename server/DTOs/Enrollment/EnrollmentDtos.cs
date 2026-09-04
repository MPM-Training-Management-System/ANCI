namespace server.DTOs.Enrollment;

public record EnrollmentParticipantDto(
    Guid Id,
    Guid UserId,
    string UserCode,
    string FullName,
    string Email,
    string? MobileNumber,
    string? ProfileImageUrl
);

public record CreateEnrollmentRequest(
    Guid TrainingBatchId
);

public record EnrollmentDocumentDto(
    Guid Id,
     Guid RequirementId,
    string RequirementName,
    string FileName,
    string FileUrl,
    string Status,
    string? ReviewRemarks
);

public record EnrollmentDto(
    Guid Id,
    Guid ParticipantProfileId,
    EnrollmentParticipantDto Participant,
    Guid TrainingBatchId,
    string ProgramName,
    string BatchCode,
    string Status,
    DateTime EnrolledAt,
    DateTime? ApprovedAt,
    string? ReviewRemarks,
    string? AttendanceToken,
    List<EnrollmentDocumentDto> Documents
);

public record ReviewEnrollmentRequest(
    string Decision,
    string? Remarks
);