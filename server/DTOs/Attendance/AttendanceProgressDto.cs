namespace server.DTOs.Attendance;

public record AttendanceProgressDto(
    Guid EnrollmentId,
    Guid TrainingBatchId,
    string ParticipantName,
    int TotalSessions,
    int AttendedSessions,
    int LateSessions,
    int AbsentSessions,
    decimal AttendancePercentage
);