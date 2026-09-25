namespace server.Models.Trainer;

public class TrainerEducation
{
    public Guid Id { get; set; }

    public Guid TrainerProfileId { get; set; }

    public string Degree { get; set; }
        = string.Empty;

    public string? FieldOfStudy { get; set; }

    public string Institution { get; set; }
        = string.Empty;

    public int? YearGraduated { get; set; }

    public TrainerProfile TrainerProfile { get; set; }
        = default!;
}