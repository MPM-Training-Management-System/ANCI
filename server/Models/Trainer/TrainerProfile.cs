using server.Models.Auth;

namespace server.Models.Trainer;

public class TrainerProfile
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

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
    // TRAINER INFORMATION
    // =========================================================

    public bool IsActive { get; set; }

    public string Specialization { get; set; }
        = string.Empty;

    public string? Bio { get; set; }

    public int? YearsOfExperience { get; set; }


    // =========================================================
    // PROFILE IMAGE
    // =========================================================

    public string? ProfileImageUrl { get; set; }


    // =========================================================
    // ACTIVATION
    // =========================================================

    public DateTime? ActivatedAt { get; set; }


    // =========================================================
    // RELATIONSHIP
    // =========================================================

    public User User { get; set; }
        = default!;
}