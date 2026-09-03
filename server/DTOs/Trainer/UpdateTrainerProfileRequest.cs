namespace server.DTOs.Trainer;

public class UpdateTrainerProfileRequest
{
    // =========================================================
    // PERSONAL INFORMATION
    // =========================================================

    public string? FirstName { get; set; }

    public string? MiddleName { get; set; }

    public string? LastName { get; set; }

    public DateOnly? BirthDate { get; set; }

    public string? Address { get; set; }

    public string? Gender { get; set; }


    // =========================================================
    // CONTACT
    // =========================================================

    public string? MobileNumber { get; set; }


    // =========================================================
    // TRAINER INFORMATION
    // =========================================================

    public string? Specialization { get; set; }

    public string? Bio { get; set; }

    public int? YearsOfExperience { get; set; }
}