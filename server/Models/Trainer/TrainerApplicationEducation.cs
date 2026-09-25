namespace server.Models.Trainer;

public class TrainerApplicationEducation
{
    public Guid Id { get; set; }

    public Guid TrainerApplicationId { get; set; }

    public string Degree { get; set; }
        = string.Empty;

    public string? FieldOfStudy { get; set; }

    public string Institution { get; set; }
        = string.Empty;

    public int? YearGraduated { get; set; }


    // =========================================================
    // RELATIONSHIP
    // =========================================================

    public TrainerApplication TrainerApplication { get; set; }
        = default!;
}