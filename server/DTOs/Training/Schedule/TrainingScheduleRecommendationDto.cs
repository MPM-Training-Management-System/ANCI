namespace server.DTOs.Training.Schedule;

public class TrainingScheduleRecommendationDto
{
    public Guid TrainingBatchId { get; set; }

    public decimal RequiredHours { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public int AvailableWeeks { get; set; }

    public int RecommendedSessionsPerWeek { get; set; }

    public decimal RecommendedHoursPerSession { get; set; }

    public decimal EstimatedWeeklyHours { get; set; }

    public int EstimatedSessionCount { get; set; }

    public bool IncludeWeekends { get; set; }
}