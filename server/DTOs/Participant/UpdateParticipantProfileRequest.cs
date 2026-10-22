using System.ComponentModel.DataAnnotations;

namespace server.DTOs.Participant;

public class UpdateParticipantProfileRequest
{
    // Personal Information
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string FirstName { get; set; } = string.Empty;

    [StringLength(100)]
    public string? MiddleName { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string LastName { get; set; } = string.Empty;

    public DateOnly? BirthDate { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [StringLength(50)]
    public string? Gender { get; set; }

    [Phone]
    [StringLength(30)]
    public string? MobileNumber { get; set; }

    // Educational Background
    [StringLength(100)]
    public string? HighestEducationalAttainment { get; set; }

    [StringLength(50)]
    public string? EducationalStatus { get; set; }

    [StringLength(200)]
    public string? SchoolName { get; set; }

    [StringLength(200)]
    public string? CourseOrDegree { get; set; }

    [StringLength(150)]
    public string? FieldOfStudy { get; set; }

    [Range(1900, 2100)]
    public int? YearGraduated { get; set; }

    // Employment Information
    [StringLength(50)]
    public string? EmploymentStatus { get; set; }

    [StringLength(200)]
    public string? CompanyName { get; set; }

    [StringLength(150)]
    public string? JobTitle { get; set; }

    [StringLength(150)]
    public string? Industry { get; set; }

    [Range(0, 80)]
    public int? YearsOfWorkExperience { get; set; }

    // Valid ID Information
    [StringLength(100)]
    public string? ValidIdType { get; set; }

    [StringLength(100)]
    public string? ValidIdNumber { get; set; }

    // Emergency Contact
    [StringLength(200)]
    public string? EmergencyContactName { get; set; }

    [Phone]
    [StringLength(30)]
    public string? EmergencyContactNumber { get; set; }

    [StringLength(100)]
    public string? EmergencyContactRelationship { get; set; }
}