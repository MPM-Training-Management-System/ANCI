using server.Models;

namespace server.DTOs.Trainer;

public class TrainerResponseDTO
{
    // ==========================================
    // IDENTIFICATION
    // ==========================================

    public Guid Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;


    // ==========================================
    // ACCOUNT INFORMATION
    // ==========================================

    public string Email { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string? MiddleName { get; set; }

    public string LastName { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;


    // ==========================================
    // PERSONAL INFORMATION
    // ==========================================

    public DateOnly DateOfBirth { get; set; }

    public string Gender { get; set; } = string.Empty;

    public string CivilStatus { get; set; } = string.Empty;


    // ==========================================
    // CONTACT INFORMATION
    // ==========================================

    public string MobileNumber { get; set; } = string.Empty;

    public string HomeAddress { get; set; } = string.Empty;


    // ==========================================
    // PROFESSIONAL INFORMATION
    // ==========================================

    public string Expertise { get; set; } = string.Empty;

    public int YearsOfExperience { get; set; }

    public string Organization { get; set; } = string.Empty;

    public string Biography { get; set; } = string.Empty;


    // ==========================================
    // VERIFICATION DOCUMENTS
    // ==========================================

    public string? ProfileImage { get; set; }

    public string? ValidId { get; set; }


    // ==========================================
    // REGISTRATION STATUS
    // ==========================================

    public bool IsProfileCompleted { get; set; }

    public bool IsActive { get; set; }

    public bool IsEmailVerified { get; set; }


    // ==========================================
    // APPLICATION STATUS
    // ==========================================

    public ApplicationStatus ApplicationStatus { get; set; }

    public PolicyStatus PolicyStatus { get; set; }

    public string? PolicyRemarks { get; set; }


    // ==========================================
    // APPLICATION DATE
    // ==========================================

    public DateTime SubmittedAt { get; set; }

    public DateTime CreatedAt { get; set; }
}