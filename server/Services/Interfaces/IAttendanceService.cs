using server.DTOs.Attendance;

namespace server.Interfaces.Attendance;

public interface IAttendanceService
{
    // =========================================================
    // SESSION
    // =========================================================

    Task<Guid> OpenSessionAsync(
        Guid trainerUserId,
        OpenAttendanceRequest request);

    Task CloseSessionAsync(
        Guid sessionId,
        Guid trainerUserId);


    // =========================================================
    // MANUAL ATTENDANCE CONTROL
    // =========================================================

    Task OpenManualAttendanceAsync(
        Guid sessionId,
        Guid trainerUserId);

    Task CloseManualAttendanceAsync(
        Guid sessionId,
        Guid trainerUserId);


    // =========================================================
    // SESSION STATUS
    // =========================================================

    Task<OpenAttendanceSessionDto> GetOpenSessionAsync(
        Guid batchId,
        Guid userId);


    // =========================================================
    // ATTENDANCE RECORDS
    // =========================================================

    Task<IEnumerable<AttendanceRecordDto>> GetSessionAsync(
        Guid sessionId,
        Guid userId);

    Task<IEnumerable<AttendanceRecordDto>> GetBatchAttendanceAsync(
        Guid batchId,
        Guid userId);


    // =========================================================
    // QR ATTENDANCE
    // =========================================================

    Task ScanAttendanceAsync(
        Guid trainerUserId,
        ScanAttendanceRequest request);


    // =========================================================
    // PARTICIPANT MANUAL ATTENDANCE
    // =========================================================

    Task ManualAttendanceAsync(
        Guid participantUserId,
        ManualAttendanceRequest request);


    // =========================================================
    // QR
    // =========================================================

    Task<AttendanceQrDto> GetQrAsync(
        Guid sessionId,
        Guid enrollmentId,
        Guid userId);
}