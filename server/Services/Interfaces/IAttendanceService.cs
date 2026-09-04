    using server.DTOs.Attendance;

    namespace server.Interfaces.Attendance;

    public interface IAttendanceService
    {
       Task<Guid> OpenSessionAsync(
    Guid trainerUserId,
    OpenAttendanceRequest request);

        Task CloseSessionAsync(
            Guid sessionId,
            Guid trainerUserId);

           Task<OpenAttendanceSessionDto> GetOpenSessionAsync(
    Guid batchId,
    Guid userId);


        Task<IEnumerable<AttendanceRecordDto>> GetSessionAsync(
            Guid sessionId,
            Guid userId);

        Task<AttendanceQrDto> GetQrAsync(
            Guid sessionId,
            Guid enrollmentId,
            Guid userId);

        Task ScanAttendanceAsync(
            Guid trainerUserId,
            ScanAttendanceRequest request);

        Task ManualAttendanceAsync(
            Guid participantUserId,
            ManualAttendanceRequest request);

        Task<IEnumerable<AttendanceRecordDto>> GetBatchAttendanceAsync(
            Guid batchId,
            Guid userId);
    }