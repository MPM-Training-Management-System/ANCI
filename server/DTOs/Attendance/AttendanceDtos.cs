namespace server.DTOs.Attendance;

public record OpenAttendanceRequest(
    Guid TrainingBatchId,
    Guid TrainingSessionId
);

public record AttendanceQrDto(
    Guid AttendanceSessionId,
    Guid EnrollmentId,
    string Token,
    DateTime ExpiresAt
);

public record OpenAttendanceSessionDto(
    bool IsOpen,
    Guid? AttendanceSessionId,
    bool ManualAttendanceOpen
);

public record ScanAttendanceRequest(
    Guid AttendanceSessionId,
    string Token
);

public record ManualAttendanceRequest(
    Guid AttendanceSessionId,
    string Action
);

public record AttendanceRecordDto(
    Guid Id,
    string ParticipantName,
    DateTime? TimeIn,
    DateTime? TimeOut,
    string Status,
    string Method
);