namespace server.DTOs.Reports;

public class AdminReportOverviewDto
{
    // =====================================================
    // TRAINING
    // =====================================================

    public int TotalTrainingPrograms { get; set; }

    public int ActiveTrainingPrograms { get; set; }

    public int TotalTrainingBatches { get; set; }

    // =====================================================
    // PARTICIPANTS
    // =====================================================

    public int TotalParticipants { get; set; }

    public int TotalEnrollments { get; set; }

    public int ActiveEnrollments { get; set; }

    // =====================================================
    // TRAINERS
    // =====================================================

    public int TotalTrainers { get; set; }

    public int ActiveTrainerAssignments { get; set; }

    // =====================================================
    // ATTENDANCE
    // =====================================================

    public int TotalAttendanceRecords { get; set; }

    public int PresentAttendance { get; set; }

    public int AbsentAttendance { get; set; }

    public int LateAttendance { get; set; }

    public decimal AttendanceRate { get; set; }

    // =====================================================
    // ASSESSMENTS
    // =====================================================

    public int TotalWrittenAssessments { get; set; }

    public int PublishedWrittenAssessments { get; set; }

    public int TotalAssessmentAttempts { get; set; }

    // =====================================================
    // CERTIFICATES
    // =====================================================

    public int TotalCertificates { get; set; }

    public int CompletionCertificates { get; set; }

    public int ParticipationCertificates { get; set; }

    public int RevokedCertificates { get; set; }

    // =====================================================
    // SERVICES
    // =====================================================

    public int TotalServices { get; set; }

    public int ActiveServices { get; set; }

    public int TotalServiceRequests { get; set; }
}