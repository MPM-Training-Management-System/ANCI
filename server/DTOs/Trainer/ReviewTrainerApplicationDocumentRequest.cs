using server.Enums;

namespace server.DTOs.Trainer;

public class ReviewTrainerApplicationDocumentRequest
{
    public DocumentStatus Status { get; set; }

    public string? ReviewRemarks { get; set; }
}