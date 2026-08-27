using server.Enums;
using server.Models.Auth;

namespace server.Models.Trainer;

public class TrainerApplication
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public TrainerApplicationStatus Status { get; set; }

    public string Specialization { get; set; } = string.Empty;

    public int? YearsOfExperience { get; set; }

    public string? CertificationName { get; set; }

    public string? CertificationNumber { get; set; }

    public string? ProfileImageUrl { get; set; }

    public string? AdminRemarks { get; set; }

    public Guid? ReviewedByUserId { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? SubmittedAt { get; set; }

    public User User { get; set; } = default!;

    public ICollection<TrainerApplicationDocument> Documents { get; set; }
        = new List<TrainerApplicationDocument>();
}