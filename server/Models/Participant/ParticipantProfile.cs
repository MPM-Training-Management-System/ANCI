using server.Models.Auth;

namespace server.Models.Participant;

public class ParticipantProfile
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

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

    // Navigation Properties
    public User User { get; set; } = default!;

    public ICollection<Enrollment> Enrollments { get; set; } = [];
}