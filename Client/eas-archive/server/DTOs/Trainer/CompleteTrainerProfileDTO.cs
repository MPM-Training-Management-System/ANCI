using Microsoft.AspNetCore.Http;

namespace server.DTOs.Trainer;

public class CompleteTrainerProfileDTO
{
    // ==========================================
    // USER INFORMATION
    // These will be saved to UserModel
    // ==========================================

    public string FirstName { get; set; } = string.Empty;

    public string? MiddleName { get; set; }

    public string LastName { get; set; } = string.Empty;


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

    public IFormFile? ProfileImage { get; set; }

    public IFormFile? ValidId { get; set; }
}