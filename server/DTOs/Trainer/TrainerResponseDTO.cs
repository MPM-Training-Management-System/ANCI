namespace server.DTOs.Trainer;

public class TrainerResponseDTO
{
    public Guid Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    // User

    public string FirstName { get; set; } = string.Empty;

    public string? MiddleName { get; set; }

    public string LastName { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    // Trainer

    public string? ProfileImageUrl { get; set; }

    public DateOnly DateOfBirth { get; set; }

    public string Gender { get; set; } = string.Empty;

    public string CivilStatus { get; set; } = string.Empty;

    public string MobileNumber { get; set; } = string.Empty;

    public string HomeAddress { get; set; } = string.Empty;

    public string Expertise { get; set; } = string.Empty;

    public int YearsOfExperience { get; set; }

    public string Organization { get; set; } = string.Empty;

    public string Biography { get; set; } = string.Empty;

    public bool IsVerified { get; set; }

    public bool IsActive { get; set; }

    public bool IsProfileCompleted { get; set; }

    public DateTime CreatedAt { get; set; }
}