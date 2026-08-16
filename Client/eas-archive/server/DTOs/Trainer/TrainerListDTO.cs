using server.Models;

namespace server.DTOs.Trainer;

public class TrainerListDTO
{
    // ==========================================
    // IDENTIFICATION
    // ==========================================

    public Guid Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;


    // ==========================================
    // USER INFORMATION
    // ==========================================

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;


    // ==========================================
    // TRAINER INFORMATION
    // ==========================================

    public string? ProfileImage { get; set; }

    public string? ValidId { get; set; }

    public string Expertise { get; set; } = string.Empty;

    public int YearsOfExperience { get; set; }

    public string Organization { get; set; } = string.Empty;


    // ==========================================
    // REGISTRATION STATUS
    // ==========================================

    public bool IsProfileCompleted { get; set; }

    public bool IsActive { get; set; }

    public bool IsEmailVerified { get; set; }


    // ==========================================
    // APPLICATION
    // ==========================================

    public ApplicationStatus ApplicationStatus { get; set; }

    public PolicyStatus PolicyStatus { get; set; }

    public string? PolicyRemarks { get; set; }


    // ==========================================
    // DATE
    // ==========================================

    public DateTime CreatedAt { get; set; }
}