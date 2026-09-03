
using server.Models.Participant;
using server.Enums;
using server.Models.Attendance;
namespace server.Models.Training;

public class TrainingBatch
{
    public Guid Id { get; set; }

    public Guid TrainingProgramId { get; set; }

    public string BatchCode { get; set; } = default!;

    public string? Location { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public TimeOnly? StartTime { get; set; }

    public TimeOnly? EndTime { get; set; }

    public int Capacity { get; set; }

    public TrainingStatus Status { get; set; }

    public TrainingProgram TrainingProgram { get; set; } = default!;

    public ICollection<TrainerAssignment> TrainerAssignments { get; set; } = [];

    public ICollection<Enrollment> Enrollments { get; set; } = [];

    // public ICollection<LearningMaterial> LearningMaterials { get; set; } = [];

    public ICollection<AttendanceSession> AttendanceSessions { get; set; } = [];

    // public ICollection<Assessment> Assessments { get; set; } = [];

    // public ICollection<Exam> Exams { get; set; } = [];
}