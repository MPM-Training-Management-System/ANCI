namespace server.DTOs.Trainer;

public class ReviewTrainerReportRequestDto
{
    public IFormFile File { get; set; } = default!;

    public string? AdminRemarks { get; set; }
}