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

    public string? FirstName { get; set; }

    public string? MiddleName { get; set; }

    public string? LastName { get; set; }

    public DateOnly? BirthDate { get; set; }

    public string? Address { get; set; }

    public string? Gender { get; set; }

    public string? ProfileImageUrl { get; set; }
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
    public string? FullName { get; set; }

    public string? Email { get; set; }

    public string? MobileNumber { get; set; }

    // Participant / Trainer common personal information

    public string? FirstName { get; set; }

    public string? MiddleName { get; set; }

    public string? LastName { get; set; }

    public DateOnly? BirthDate { get; set; }

    public string? Address { get; set; }

    public string? Gender { get; set; }

    // Trainer-only fields

    public string? Specialization { get; set; }

    public string? Bio { get; set; }

    public int? YearsOfExperience { get; set; }

    public bool? IsActive { get; set; }
}


// =========================================================
// UPDATE STATUS
// =========================================================

public class UpdateAdminUserStatusRequest
{
    public UserStatus Status { get; set; }
}