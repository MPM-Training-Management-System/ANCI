namespace server.DTOs.TrainerDashboard;

public class TrainerDashboardTrainingDto
{
    public Guid TrainingBatchId { get; set; }

    public string TrainingName { get; set; } = string.Empty;

    public string BatchName { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public int ParticipantCount { get; set; }
}