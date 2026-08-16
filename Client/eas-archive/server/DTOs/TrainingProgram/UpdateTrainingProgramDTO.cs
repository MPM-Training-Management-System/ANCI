public class UpdateTrainingProgramDto
{
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Objectives { get; set; } = string.Empty;
    public string Venue { get; set; } = string.Empty;

    public int MaxParticipants { get; set; }

    public Guid? TrainerId { get; set; }

    public IFormFile? Thumbnail { get; set; }

    public string Status { get; set; } = "Draft";

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}