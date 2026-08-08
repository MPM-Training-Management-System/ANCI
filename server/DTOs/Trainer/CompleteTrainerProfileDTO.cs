namespace server.DTOs.Trainer;

public class CompleteTrainerProfileDTO
{
    public IFormFile? ProfileImage { get; set; }

    public string? MiddleName { get; set; }

    public DateOnly DateOfBirth { get; set; }

    public string Gender { get; set; } = string.Empty;

    public string CivilStatus { get; set; } = string.Empty;

    public string MobileNumber { get; set; } = string.Empty;

    public string HomeAddress { get; set; } = string.Empty;

    public string Expertise { get; set; } = string.Empty;

    public int YearsOfExperience { get; set; }

    public string Organization { get; set; } = string.Empty;

    public string Biography { get; set; } = string.Empty;
}