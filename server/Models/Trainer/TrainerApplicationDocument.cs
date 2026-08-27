using server.Enums;

namespace server.Models.Trainer;

public class TrainerApplicationDocument
{
    public Guid Id { get; set; }

    public Guid TrainerApplicationId { get; set; }

    public string DocumentType { get; set; } = string.Empty;

    public string FileName { get; set; } = string.Empty;

    public string FileUrl { get; set; } = string.Empty;

    public DocumentStatus Status { get; set; }

    public string? ReviewRemarks { get; set; }

    public Guid? ReviewedByUserId { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public DateTime UploadedAt { get; set; }

    public TrainerApplication TrainerApplication { get; set; }
        = default!;
}