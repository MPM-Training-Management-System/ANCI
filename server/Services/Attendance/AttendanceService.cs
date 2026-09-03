using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Attendance;
using server.Enums;
using server.Interfaces.Attendance;
using server.Models.Attendance;

namespace server.Services.Attendance;

public class AttendanceService : IAttendanceService
{
    private readonly ApplicationDbContext _context;
    private readonly IDataProtector _attendanceProtector;

   public AttendanceService(
    ApplicationDbContext context,
    IDataProtectionProvider dataProtectionProvider)
{
    _context = context;

    _attendanceProtector =
        dataProtectionProvider.CreateProtector("ANCI.Attendance.QR");
}

    public async Task OpenSessionAsync(
        Guid trainerUserId,
        OpenAttendanceRequest request)
    {
        if (request is null)
            throw new ArgumentException(
                "Attendance request is required.");

        var batch = await _context.TrainingBatches
            .Include(x => x.TrainerAssignments)
                .ThenInclude(x => x.TrainerProfile)
            .FirstOrDefaultAsync(
                x => x.Id == request.TrainingBatchId);

        if (batch is null)
            throw new KeyNotFoundException(
                "Training batch not found.");

        var isAssignedTrainer = batch.TrainerAssignments
            .Any(x =>
                x.IsActive &&
                x.TrainerProfile.UserId == trainerUserId);

        if (!isAssignedTrainer)
            throw new UnauthorizedAccessException(
                "You are not the assigned trainer for this training batch.");

        var existingOpenSession = await _context.AttendanceSessions
            .AnyAsync(x =>
                x.TrainingBatchId == request.TrainingBatchId &&
                x.Status == AttendanceSessionStatus.Open);

        if (existingOpenSession)
            throw new InvalidOperationException(
                "An attendance session is already open for this training batch.");

        var session = new AttendanceSession
        {
            Id = Guid.NewGuid(),
            TrainingBatchId = request.TrainingBatchId,
            OpenedAt = DateTime.UtcNow,
            ClosedAt = null,
            Status = AttendanceSessionStatus.Open,
            OpenedByUserId = trainerUserId
        };

        _context.AttendanceSessions.Add(session);

        await _context.SaveChangesAsync();
    }

    public async Task CloseSessionAsync(
        Guid sessionId,
        Guid trainerUserId)
    {
        var session = await _context.AttendanceSessions
            .Include(x => x.TrainingBatch)
                .ThenInclude(x => x.TrainerAssignments)
                    .ThenInclude(x => x.TrainerProfile)
            .FirstOrDefaultAsync(x => x.Id == sessionId);

        if (session is null)
            throw new KeyNotFoundException(
                "Attendance session not found.");

        var isAssignedTrainer = session.TrainingBatch
            .TrainerAssignments
            .Any(x =>
                x.IsActive &&
                x.TrainerProfile.UserId == trainerUserId);

        if (!isAssignedTrainer)
            throw new UnauthorizedAccessException(
                "You are not the assigned trainer for this training batch.");

        if (session.Status == AttendanceSessionStatus.Closed)
            throw new InvalidOperationException(
                "Attendance session is already closed.");

        session.Status = AttendanceSessionStatus.Closed;
        session.ClosedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<AttendanceRecordDto>> GetSessionAsync(
        Guid sessionId,
        Guid userId)
    {
        var session = await _context.AttendanceSessions
            .Include(x => x.TrainingBatch)
                .ThenInclude(x => x.TrainerAssignments)
                    .ThenInclude(x => x.TrainerProfile)
            .FirstOrDefaultAsync(x => x.Id == sessionId);

        if (session is null)
            throw new KeyNotFoundException(
                "Attendance session not found.");

        var isTrainer = session.TrainingBatch
            .TrainerAssignments
            .Any(x =>
                x.IsActive &&
                x.TrainerProfile.UserId == userId);

        var isAdmin = await _context.Users
            .AnyAsync(x =>
                x.Id == userId &&
                x.Role == UserRole.Admin);

        var isParticipant = await _context.Enrollments
            .AnyAsync(x =>
                x.TrainingBatchId == session.TrainingBatchId &&
                x.ParticipantProfile.UserId == userId);

        if (!isTrainer && !isAdmin && !isParticipant)
            throw new UnauthorizedAccessException(
                "You are not authorized to view this attendance session.");

        return await _context.AttendanceRecords
            .AsNoTracking()
            .Where(x => x.AttendanceSessionId == sessionId)
            .Include(x => x.Enrollment)
                .ThenInclude(x => x.ParticipantProfile)
                    .ThenInclude(x => x.User)
            .Select(x => new AttendanceRecordDto(
                x.Id,
                x.Enrollment.ParticipantProfile.User.FullName,
                x.TimeIn,
                x.TimeOut,
                x.Status.ToString(),
                x.Method ?? string.Empty
            ))
            .ToListAsync();
    }

   public async Task<AttendanceQrDto> GetQrAsync(
    Guid sessionId,
    Guid enrollmentId,
    Guid trainerUserId)
{
    var session = await _context.AttendanceSessions
        .Include(x => x.TrainingBatch)
            .ThenInclude(x => x.TrainerAssignments)
                .ThenInclude(x => x.TrainerProfile)
        .FirstOrDefaultAsync(x => x.Id == sessionId);

    if (session is null)
        throw new KeyNotFoundException(
            "Attendance session not found.");

    if (session.Status != AttendanceSessionStatus.Open)
        throw new InvalidOperationException(
            "Attendance session is closed.");

    var isAssignedTrainer =
        session.TrainingBatch.TrainerAssignments.Any(x =>
            x.IsActive &&
            x.TrainerProfile.UserId == trainerUserId);

    if (!isAssignedTrainer)
        throw new UnauthorizedAccessException(
            "You are not the assigned trainer for this training batch.");

    var enrollment = await _context.Enrollments
        .Include(x => x.ParticipantProfile)
        .FirstOrDefaultAsync(x =>
            x.Id == enrollmentId &&
            x.TrainingBatchId == session.TrainingBatchId);

    if (enrollment is null)
        throw new KeyNotFoundException(
            "Enrollment not found for this training batch.");

    var expiresAt = DateTime.UtcNow.AddMinutes(5);

    var payload =
        $"{session.Id}|{enrollment.Id}|{expiresAt.Ticks}";

    var token = _attendanceProtector.Protect(payload);

    return new AttendanceQrDto(
        session.Id,
        enrollment.Id,
        token,
        expiresAt
    );
}

   public async Task ScanAttendanceAsync(
    Guid trainerUserId,
    ScanAttendanceRequest request)
{
    if (request is null)
        throw new ArgumentException(
            "Scan attendance request is required.");

    var session = await _context.AttendanceSessions
        .Include(x => x.TrainingBatch)
            .ThenInclude(x => x.TrainerAssignments)
                .ThenInclude(x => x.TrainerProfile)
        .FirstOrDefaultAsync(x =>
            x.Id == request.AttendanceSessionId);

    if (session is null)
        throw new KeyNotFoundException(
            "Attendance session not found.");

    if (session.Status != AttendanceSessionStatus.Open)
        throw new InvalidOperationException(
            "Attendance session is closed.");

    var isAssignedTrainer =
        session.TrainingBatch.TrainerAssignments.Any(x =>
            x.IsActive &&
            x.TrainerProfile.UserId == trainerUserId);

    if (!isAssignedTrainer)
        throw new UnauthorizedAccessException(
            "You are not the assigned trainer for this training batch.");

    string payload;

    try
    {
        payload = _attendanceProtector.Unprotect(request.Token);
    }
    catch
    {
        throw new UnauthorizedAccessException(
            "Invalid attendance QR token.");
    }

    var parts = payload.Split('|');

    if (parts.Length != 3)
        throw new UnauthorizedAccessException(
            "Invalid attendance QR token.");

    if (!Guid.TryParse(parts[0], out var tokenSessionId))
        throw new UnauthorizedAccessException(
            "Invalid attendance QR token.");

    if (!Guid.TryParse(parts[1], out var enrollmentId))
        throw new UnauthorizedAccessException(
            "Invalid attendance QR token.");

    if (!long.TryParse(parts[2], out var expiresTicks))
        throw new UnauthorizedAccessException(
            "Invalid attendance QR token.");

    var expiresAt = new DateTime(
        expiresTicks,
        DateTimeKind.Utc);

    if (DateTime.UtcNow > expiresAt)
        throw new InvalidOperationException(
            "Attendance QR token has expired.");

    if (tokenSessionId != session.Id)
        throw new UnauthorizedAccessException(
            "QR token does not belong to this attendance session.");

    var enrollment = await _context.Enrollments
        .Include(x => x.ParticipantProfile)
        .FirstOrDefaultAsync(x =>
            x.Id == enrollmentId &&
            x.TrainingBatchId == session.TrainingBatchId);

    if (enrollment is null)
        throw new KeyNotFoundException(
            "Enrollment not found for this training batch.");

    var existingRecord = await _context.AttendanceRecords
        .FirstOrDefaultAsync(x =>
            x.AttendanceSessionId == session.Id &&
            x.EnrollmentId == enrollment.Id);

    if (existingRecord is not null)
    {
        throw new InvalidOperationException(
            "Participant already has an attendance record for this session.");
    }

    var record = new AttendanceRecord
    {
        Id = Guid.NewGuid(),
        AttendanceSessionId = session.Id,
        EnrollmentId = enrollment.Id,
        TimeIn = DateTime.UtcNow,
        TimeOut = null,
        Status = AttendanceStatus.TimeInOnly,
        Method = "QR"
    };

    _context.AttendanceRecords.Add(record);

    await _context.SaveChangesAsync();
}

   public async Task ManualAttendanceAsync(
    Guid participantUserId,
    ManualAttendanceRequest request)
{
    if (request is null)
        throw new ArgumentException(
            "Attendance request is required.");

    var action = request.Action
        .Trim()
        .ToLowerInvariant();

    if (action != "timein" && action != "timeout")
    {
        throw new ArgumentException(
            "Action must be TimeIn or TimeOut.");
    }

    var session = await _context.AttendanceSessions
        .FirstOrDefaultAsync(x =>
            x.Id == request.AttendanceSessionId);

    if (session is null)
        throw new KeyNotFoundException(
            "Attendance session not found.");

    if (session.Status != AttendanceSessionStatus.Open)
        throw new InvalidOperationException(
            "Attendance session is closed.");

    var enrollment = await _context.Enrollments
        .Include(x => x.ParticipantProfile)
        .FirstOrDefaultAsync(x =>
            x.TrainingBatchId == session.TrainingBatchId &&
            x.ParticipantProfile.UserId == participantUserId);

    if (enrollment is null)
        throw new UnauthorizedAccessException(
            "You are not enrolled in this training batch.");

    if (enrollment.Status != EnrollmentStatus.Approved)
        throw new InvalidOperationException(
            "Only approved participants can record attendance.");

    var record = await _context.AttendanceRecords
        .FirstOrDefaultAsync(x =>
            x.AttendanceSessionId == session.Id &&
            x.EnrollmentId == enrollment.Id);

    if (action == "timein")
    {
        if (record is not null && record.TimeIn.HasValue)
            throw new InvalidOperationException(
                "You have already recorded your Time In.");

        if (record is null)
        {
            record = new AttendanceRecord
            {
                Id = Guid.NewGuid(),
                AttendanceSessionId = session.Id,
                EnrollmentId = enrollment.Id,
                TimeIn = DateTime.UtcNow,
                TimeOut = null,
                Status = AttendanceStatus.TimeInOnly,
                Method = "Manual"
            };

            _context.AttendanceRecords.Add(record);
        }
        else
        {
            record.TimeIn = DateTime.UtcNow;
            record.Status = AttendanceStatus.TimeInOnly;
            record.Method = "Manual";
        }
    }
    else
    {
        if (record is null || !record.TimeIn.HasValue)
            throw new InvalidOperationException(
                "You must record Time In first.");

        if (record.TimeOut.HasValue)
            throw new InvalidOperationException(
                "You have already recorded your Time Out.");

        record.TimeOut = DateTime.UtcNow;
        record.Status = AttendanceStatus.Present;
        record.Method = "Manual";
    }

    await _context.SaveChangesAsync();
}

    public async Task<IEnumerable<AttendanceRecordDto>> GetBatchAttendanceAsync(
        Guid batchId,
        Guid userId)
    {
        var batch = await _context.TrainingBatches
            .Include(x => x.TrainerAssignments)
                .ThenInclude(x => x.TrainerProfile)
            .FirstOrDefaultAsync(x => x.Id == batchId);

        if (batch is null)
            throw new KeyNotFoundException(
                "Training batch not found.");

        var isTrainer = batch.TrainerAssignments
            .Any(x =>
                x.IsActive &&
                x.TrainerProfile.UserId == userId);

        var isAdmin = await _context.Users
            .AnyAsync(x =>
                x.Id == userId &&
                x.Role == UserRole.Admin);

        var isParticipant = await _context.Enrollments
            .AnyAsync(x =>
                x.TrainingBatchId == batchId &&
                x.ParticipantProfile.UserId == userId);

        if (!isTrainer && !isAdmin && !isParticipant)
            throw new UnauthorizedAccessException(
                "You are not authorized to view attendance for this training batch.");

        return await _context.AttendanceRecords
            .AsNoTracking()
            .Where(x =>
                x.AttendanceSession.TrainingBatchId == batchId)
            .Include(x => x.Enrollment)
                .ThenInclude(x => x.ParticipantProfile)
                    .ThenInclude(x => x.User)
            .Select(x => new AttendanceRecordDto(
                x.Id,
                x.Enrollment.ParticipantProfile.User.FullName,
                x.TimeIn,
                x.TimeOut,
                x.Status.ToString(),
                x.Method ?? string.Empty
            ))
            .ToListAsync();
    }
}