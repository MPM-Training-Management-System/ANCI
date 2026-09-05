namespace server.DTOs.Training.Schedule;

public class GenerateTrainingScheduleRequest
{
    public int SessionsPerWeek { get; set; }

    public TimeOnly StartTime { get; set; }

    public TimeOnly EndTime { get; set; }

    public bool IncludeWeekends { get; set; }
}