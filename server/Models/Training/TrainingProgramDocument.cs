namespace server.Models.Training;

public class TrainingProgramDocument
{
    public Guid Id { get; set; }

    public Guid TrainingProgramId { get; set; }

    public string DocumentName { get; set; } = string.Empty;

    

    public string FileUrl { get; set; } = string.Empty;

    public string? PublicId { get; set; }

    public DateTime UploadedAt { get; set; }

    

    public TrainingProgram TrainingProgram { get; set; } = null!;
}