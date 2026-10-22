
using server.Enums;

namespace server.DTOs.Admin;

// =========================================================
// USER LIST
// =========================================================

public class AdminUserListDto
{
    public Guid Id { get; set; }

    public string UserCode { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? MobileNumber { get; set; }

    public UserRole Role { get; set; }

    public UserStatus Status { get; set; }

    public bool IsEmailVerified { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string? ProfileImageUrl { get; set; }
}


// =========================================================
// USER DETAILS
// =========================================================

public class AdminUserDetailsDto
{
    public Guid Id { get; set; }

    public string UserCode { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? MobileNumber { get; set; }

    public UserRole Role { get; set; }

    public UserStatus Status { get; set; }

    public bool IsEmailVerified { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public AdminParticipantProfileDto? ParticipantProfile { get; set; }

    public AdminTrainerProfileDto? TrainerProfile { get; set; }
}


// =========================================================
// PARTICIPANT PROFILE
// =========================================================

public class AdminParticipantProfileDto
{
    public Guid Id { get; set; }

    // Personal Information
    public string? FirstName { get; set; }

    public string? MiddleName { get; set; }

    public string? LastName { get; set; }

    public DateOnly? BirthDate { get; set; }

    public string? Address { get; set; }

    public string? Gender { get; set; }

    public string? ProfileImageUrl { get; set; }


    // Educational Background
    public string? HighestEducationalAttainment { get; set; }

    public string? EducationalStatus { get; set; }

    public string? SchoolName { get; set; }

    public string? CourseOrDegree { get; set; }

    public string? FieldOfStudy { get; set; }

    public int? YearGraduated { get; set; }


    // Employment Information
    public string? EmploymentStatus { get; set; }

    public string? CompanyName { get; set; }

    public string? JobTitle { get; set; }

    public string? Industry { get; set; }

    public int? YearsOfWorkExperience { get; set; }


    // Valid ID Information
    public string? ValidIdType { get; set; }

    public string? ValidIdNumber { get; set; }

    public string? ValidIdImageUrl { get; set; }

    public string? ValidIdVerificationStatus { get; set; }

    public string? ValidIdRemarks { get; set; }

    public DateTime? ValidIdVerifiedAt { get; set; }

    public Guid? ValidIdVerifiedBy { get; set; }


    // Emergency Contact
    public string? EmergencyContactName { get; set; }

    public string? EmergencyContactNumber { get; set; }

    public string? EmergencyContactRelationship { get; set; }
}


// =========================================================
// TRAINER PROFILE
// =========================================================

public class AdminTrainerProfileDto
{
    public Guid Id { get; set; }

    public string? FirstName { get; set; }

    public string? MiddleName { get; set; }

    public string? LastName { get; set; }

    public DateOnly? BirthDate { get; set; }

    public string? Address { get; set; }

    public string? Gender { get; set; }

    public bool IsActive { get; set; }

    public string Specialization { get; set; } = string.Empty;

    public string? Bio { get; set; }

    public int? YearsOfExperience { get; set; }

    public string? ProfileImageUrl { get; set; }

    public DateTime? ActivatedAt { get; set; }
}


// =========================================================
// UPDATE USER
// =========================================================

public class UpdateAdminUserRequest
{
    // Common Account Information
    public string? FullName { get; set; }

    public string? Email { get; set; }

    public string? MobileNumber { get; set; }


    // Common Personal Information
    public string? FirstName { get; set; }

    public string? MiddleName { get; set; }

    public string? LastName { get; set; }

    public DateOnly? BirthDate { get; set; }

    public string? Address { get; set; }

    public string? Gender { get; set; }


    // Participant: Educational Background
    public string? HighestEducationalAttainment { get; set; }

    public string? EducationalStatus { get; set; }

    public string? SchoolName { get; set; }

    public string? CourseOrDegree { get; set; }

    public string? FieldOfStudy { get; set; }

    public int? YearGraduated { get; set; }


    // Participant: Employment Information
    public string? EmploymentStatus { get; set; }

    public string? CompanyName { get; set; }

    public string? JobTitle { get; set; }

    public string? Industry { get; set; }

    public int? YearsOfWorkExperience { get; set; }


    // Participant: Emergency Contact
    public string? EmergencyContactName { get; set; }

    public string? EmergencyContactNumber { get; set; }

    public string? EmergencyContactRelationship { get; set; }


    // Trainer-only Fields
    public string? Specialization { get; set; }

    public string? Bio { get; set; }

    public int? YearsOfExperience { get; set; }

    public bool? IsActive { get; set; }
}


// =========================================================
// UPDATE USER STATUS
// =========================================================

public class UpdateAdminUserStatusRequest
{
    public UserStatus Status { get; set; }
}
