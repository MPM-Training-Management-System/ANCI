using server.Models.Auth;

namespace server.Models.Trainer;

public class TrainerProfile
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public bool IsActive { get; set; }

    public string Specialization { get; set; }
        = string.Empty;

    public string? Bio { get; set; }

    public int? YearsOfExperience { get; set; }

    public string? ProfileImageUrl { get; set; }

    public DateTime ActivatedAt { get; set; }

    public User User { get; set; }
        = default!;
}