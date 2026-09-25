namespace server.DTOs.Admin;

public class AdminDashboardDto
{
    public UserStatsDto Users { get; set; } = default!;

    public TrainingStatsDto Training { get; set; } = default!;

    public EnrollmentStatsDto Enrollments { get; set; } = default!;

    public TrainerApplicationStatsDto TrainerApplications { get; set; } = default!;

    public ServiceRequestStatsDto ServiceRequests { get; set; } = default!;

    public CertificateStatsDto Certificates { get; set; } = default!;

    public AssessmentStatsDto Assessments { get; set; } = default!;

    public AttendanceStatsDto Attendance { get; set; } = default!;

    public List<MonthlyActivityDto> MonthlyActivity { get; set; } = new();

    public List<RecentEnrollmentDto> RecentEnrollments { get; set; } = new();

    public List<UpcomingBatchDto> UpcomingBatches { get; set; } = new();
}

public class UserStatsDto
{
    public int TotalUsers { get; set; }
    public int TotalParticipants { get; set; }
    public int TotalTrainers { get; set; }
    public int TotalAdmins { get; set; }
    public int UnverifiedEmailCount { get; set; }
}
public class MonthlyActivityDto
{
    public string Month { get; set; } = string.Empty;

    public int Enrollments { get; set; }

    public int CompletedTrainings { get; set; }
}
public class TrainingStatsDto
{
    public int ActiveTrainingPrograms { get; set; }
    public int TotalTrainingPrograms { get; set; }
    public int TotalBatches { get; set; }
    public int OngoingBatches { get; set; }
    public int UpcomingBatchesCount { get; set; }
    public int CompletedBatches { get; set; }
}

public class EnrollmentStatsDto
{
    public int TotalEnrollments { get; set; }
    public int PendingEnrollments { get; set; }
    public int ApprovedEnrollments { get; set; }
    public int RejectedEnrollments { get; set; }
    public int CompletedEnrollments { get; set; }
}

public class TrainerApplicationStatsDto
{
    public int TotalApplications { get; set; }
    public int PendingApplications { get; set; }
    public int ApprovedApplications { get; set; }
    public int RejectedApplications { get; set; }
}

public class ServiceRequestStatsDto
{
    public int TotalRequests { get; set; }
    public int PendingRequests { get; set; }
    public int ResolvedRequests { get; set; }
}

public class CertificateStatsDto
{
    public int TotalIssued { get; set; }
    public int IssuedThisMonth { get; set; }
    public int RevokedCount { get; set; }
}

public class AssessmentStatsDto
{
    public int TotalAttemptsEvaluated { get; set; }
    public int PassedCount { get; set; }
    public int FailedCount { get; set; }
    public double PassRatePercentage { get; set; }
}

public class AttendanceStatsDto
{
    public int TotalRecordsToday { get; set; }
    public int PresentToday { get; set; }
    public int AbsentToday { get; set; }
}

public class RecentEnrollmentDto
{
    public Guid EnrollmentId { get; set; }
    public string ParticipantName { get; set; } = string.Empty;
    public string BatchCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime EnrolledAt { get; set; }
}

public class UpcomingBatchDto
{
    public Guid TrainingBatchId { get; set; }
    public string BatchCode { get; set; } = string.Empty;
    public string ProgramName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public int Capacity { get; set; }
    public int EnrolledCount { get; set; }
}