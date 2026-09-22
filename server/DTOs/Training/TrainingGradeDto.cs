namespace server.DTOs.Training;

public class TrainingGradeDto
{
    public Guid EnrollmentId { get; set; }
    public Guid TrainingBatchId { get; set; }
    public string? BatchCode { get; set; }
    public string? ParticipantName { get; set; }
    public string? ProfileImageUrl { get; set; }
    public decimal AttendancePercentage { get; set; }
    public decimal AttendanceWeight { get; set; } = 20m;
    public decimal AttendanceWeightedScore { get; set; }

    public decimal ParticipationPercentage { get; set; }
    public decimal ParticipationWeight { get; set; } = 20m;
    public decimal ParticipationWeightedScore { get; set; }

    public decimal ExamPercentage { get; set; }
    public decimal ExamWeight { get; set; } = 30m;
    public decimal ExamWeightedScore { get; set; }

    public decimal PracticalPercentage { get; set; }
    public decimal PracticalWeight { get; set; } = 30m;
    public decimal PracticalWeightedScore { get; set; }

    public decimal OverallGrade { get; set; }

    public bool IsPassed { get; set; }
}
