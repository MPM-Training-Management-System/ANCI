namespace server.DTOs.Trainer;

public class ReviewTrainerApplicationRequest
{
    public string Decision { get; set; }
        = string.Empty;

    public string? Remarks { get; set; }
}