namespace server.DTOs.Participant;

public record ParticipantProfileDto(
    Guid Id,
    Guid UserId,
    string UserCode,
    string FullName,
    string Email,
    string? MobileNumber,

    // Personal Information
    string? FirstName,
    string? MiddleName,
    string? LastName,
    DateOnly? BirthDate,
    string? Address,
    string? Gender,
    string? ProfileImageUrl,

    // Educational Background
    string? HighestEducationalAttainment,
    string? EducationalStatus,
    string? SchoolName,
    string? CourseOrDegree,
    string? FieldOfStudy,
    int? YearGraduated,

    // Employment Information
    string? EmploymentStatus,
    string? CompanyName,
    string? JobTitle,
    string? Industry,
    int? YearsOfWorkExperience,

    // Valid ID Information
    string? ValidIdType,
    string? ValidIdNumber,
    string? ValidIdImageUrl,
    string? ValidIdVerificationStatus,
    string? ValidIdRemarks,
    DateTime? ValidIdVerifiedAt,

    // Emergency Contact
    string? EmergencyContactName,
    string? EmergencyContactNumber,
    string? EmergencyContactRelationship,

    // Account Information
    string Role,
    string Status
);