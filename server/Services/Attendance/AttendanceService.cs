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
            dataProtectionProvider.CreateProtector(
                "ANCI.Attendance.QR");
    }

    // =========================================================
    // OPEN ATTENDANCE SESSION
    // Trainer
    //
    // OPEN means:
    // Participant manual Time In / Time Out is allowed.
    //
    // QR is NOT controlled by this status.
    // =========================================================

  public async Task<Guid> OpenSessionAsync(
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

    var existingOpenSession =
        await _context.AttendanceSessions
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

    return session.Id;
}
    // =========================================================
    // CLOSE ATTENDANCE SESSION
    // Trainer
    //
    // CLOSE means:
    // Participant manual attendance is disabled.
    //
    // QR remains available.
    // Trainer QR scanning remains available.
    // =========================================================

    public async Task CloseSessionAsync(
        Guid sessionId,
        Guid trainerUserId)
    {
        var session = await _context.AttendanceSessions
            .Include(x => x.TrainingBatch)
                .ThenInclude(x => x.TrainerAssignments)
                    .ThenInclude(x => x.TrainerProfile)
            .FirstOrDefaultAsync(
                x => x.Id == sessionId);

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

    // =========================================================
    // GET ATTENDANCE SESSION
    // Trainer / Participant / Admin
    // =========================================================

    public async Task<IEnumerable<AttendanceRecordDto>> GetSessionAsync(
        Guid sessionId,
        Guid userId)
    {
        var session = await _context.AttendanceSessions
            .Include(x => x.TrainingBatch)
                .ThenInclude(x => x.TrainerAssignments)
                    .ThenInclude(x => x.TrainerProfile)
            .FirstOrDefaultAsync(
                x => x.Id == sessionId);

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
            .Where(x =>
                x.AttendanceSessionId == sessionId)
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

    // =========================================================
    // GET ATTENDANCE QR
    // Trainer / Participant
    //
    // IMPORTANT:
    // QR works whether session is OPEN or CLOSED.
    // =========================================================

   public async Task<AttendanceQrDto> GetQrAsync(
    Guid sessionId,
    Guid enrollmentId,
    Guid userId)
{
    var session =
        await _context.AttendanceSessions
            .Include(x =>
                x.TrainingBatch)
                .ThenInclude(x =>
                    x.TrainerAssignments)
                    .ThenInclude(x =>
                        x.TrainerProfile)
            .FirstOrDefaultAsync(
                x =>
                    x.Id ==
                    sessionId
            );

    if (session is null)
        throw new KeyNotFoundException(
            "Attendance session not found."
        );


    var enrollment =
        await _context.Enrollments
            .Include(x =>
                x.ParticipantProfile)
            .FirstOrDefaultAsync(
                x =>
                    x.Id ==
                    enrollmentId &&

                    x.TrainingBatchId ==
                    session.TrainingBatchId
            );

    if (enrollment is null)
        throw new KeyNotFoundException(
            "Enrollment not found for this training batch."
        );


    // =====================================================
    // MUST BE APPROVED
    // =====================================================

    if (
        enrollment.Status !=
        EnrollmentStatus.Approved
    )
    {
        throw new InvalidOperationException(
            "Only approved participants have an attendance QR."
        );
    }


    // =====================================================
    // AUTHORIZATION
    // =====================================================

    var isAssignedTrainer =
        session
            .TrainingBatch
            .TrainerAssignments
            .Any(
                x =>
                    x.IsActive &&
                    x.TrainerProfile.UserId ==
                    userId
            );


    var isParticipant =
        enrollment
            .ParticipantProfile
            .UserId ==
        userId;


    if (
        !isAssignedTrainer &&
        !isParticipant
    )
    {
        throw new UnauthorizedAccessException(
            "You are not authorized to access this attendance QR."
        );
    }


    // =====================================================
    // PERMANENT TOKEN
    // =====================================================

    if (
        string.IsNullOrWhiteSpace(
            enrollment.AttendanceToken
        )
    )
    {
        throw new InvalidOperationException(
            "Attendance QR token has not been generated."
        );
    }


    // =====================================================
    // NO EXPIRATION
    // =====================================================

    return new AttendanceQrDto(
        session.Id,
        enrollment.Id,
        enrollment.AttendanceToken,
        DateTime.MaxValue
    );
}

    // =========================================================
    // SCAN ATTENDANCE
    // Trainer
    //
    // IMPORTANT:
    // Trainer can scan QR whether OPEN or CLOSED.
    // =========================================================

    public async Task ScanAttendanceAsync(
    Guid trainerUserId,
    ScanAttendanceRequest request)
{
    if (request is null)
        throw new ArgumentException(
            "Scan attendance request is required.");

    var session =
        await _context.AttendanceSessions
            .Include(x =>
                x.TrainingBatch)
                .ThenInclude(x =>
                    x.TrainerAssignments)
                    .ThenInclude(x =>
                        x.TrainerProfile)
            .FirstOrDefaultAsync(
                x =>
                    x.Id ==
                    request.AttendanceSessionId);

    if (session is null)
        throw new KeyNotFoundException(
            "Attendance session not found.");

    // =====================================================
    // TRAINER CHECK
    // =====================================================

    var isAssignedTrainer =
        session
            .TrainingBatch
            .TrainerAssignments
            .Any(
                x =>
                    x.IsActive &&
                    x.TrainerProfile.UserId ==
                    trainerUserId);

    if (!isAssignedTrainer)
        throw new UnauthorizedAccessException(
            "You are not the assigned trainer for this training batch.");

    // =====================================================
    // SESSION MUST BE OPEN
    // =====================================================

    if (
        session.Status !=
        AttendanceSessionStatus.Open)
    {
        throw new InvalidOperationException(
            "Attendance session is currently closed.");
    }

    // =====================================================
    // FIND ENROLLMENT BY PERMANENT TOKEN
    // =====================================================

    var enrollment =
        await _context.Enrollments
            .Include(x =>
                x.ParticipantProfile)
            .FirstOrDefaultAsync(
                x =>
                    x.AttendanceToken ==
                    request.Token);

    if (enrollment is null)
        throw new UnauthorizedAccessException(
            "Invalid attendance QR.");

    // =====================================================
    // VERIFY SAME BATCH
    // =====================================================

    if (
        enrollment.TrainingBatchId !=
        session.TrainingBatchId)
    {
        throw new UnauthorizedAccessException(
            "Participant does not belong to this training batch.");
    }

    // =====================================================
    // APPROVED ONLY
    // =====================================================

    if (
        enrollment.Status !=
        EnrollmentStatus.Approved)
    {
        throw new InvalidOperationException(
            "Only approved participants can record attendance.");
    }

    // =====================================================
    // FIND EXISTING ATTENDANCE RECORD
    // =====================================================

    var existingRecord =
        await _context.AttendanceRecords
            .FirstOrDefaultAsync(
                x =>
                    x.AttendanceSessionId ==
                    session.Id &&
                    x.EnrollmentId ==
                    enrollment.Id);

    // =====================================================
    // FIRST SCAN = TIME IN
    // =====================================================

    if (existingRecord is null)
    {
        var record =
            new AttendanceRecord
            {
                Id = Guid.NewGuid(),

                AttendanceSessionId =
                    session.Id,

                EnrollmentId =
                    enrollment.Id,

                TimeIn =
                    DateTime.UtcNow,

                TimeOut =
                    null,

                Status =
                    AttendanceStatus.TimeInOnly,

                Method =
                    "QR"
            };

        _context.AttendanceRecords.Add(record);

        await _context.SaveChangesAsync();

        return;
    }

    // =====================================================
    // SECOND SCAN = TIME OUT
    // =====================================================

    if (
        existingRecord.TimeIn.HasValue &&
        !existingRecord.TimeOut.HasValue)
    {
        existingRecord.TimeOut =
            DateTime.UtcNow;

        existingRecord.Status =
            AttendanceStatus.Present;

        existingRecord.Method =
            "QR";

        await _context.SaveChangesAsync();

        return;
    }

    // =====================================================
    // THIRD SCAN = ALREADY COMPLETE
    // =====================================================

    if (existingRecord.TimeOut.HasValue)
    {
        throw new InvalidOperationException(
            "Participant has already completed attendance for this session.");
    }
}
    public async Task ManualAttendanceAsync(
        Guid participantUserId,
        ManualAttendanceRequest request)
    {
        if (request is null)
            throw new ArgumentException(
                "Attendance request is required.");

        var action =
            request.Action
                .Trim()
                .ToLowerInvariant();

        if (action != "timein" &&
            action != "timeout")
        {
            throw new ArgumentException(
                "Action must be TimeIn or TimeOut.");
        }

        var session =
            await _context.AttendanceSessions
                .FirstOrDefaultAsync(x =>
                    x.Id == request.AttendanceSessionId);

        if (session is null)
            throw new KeyNotFoundException(
                "Attendance session not found.");

        // Participant manual attendance is ONLY allowed
        // while the trainer has opened attendance.

        if (session.Status != AttendanceSessionStatus.Open)
            throw new InvalidOperationException(
                "Attendance is currently closed for participants.");

        var enrollment =
            await _context.Enrollments
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

        var record =
            await _context.AttendanceRecords
                .FirstOrDefaultAsync(x =>
                    x.AttendanceSessionId == session.Id &&
                    x.EnrollmentId == enrollment.Id);

        // =====================================================
        // TIME IN
        // =====================================================

        if (action == "timein")
        {
            if (record is not null &&
                record.TimeIn.HasValue)
            {
                throw new InvalidOperationException(
                    "You have already recorded your Time In.");
            }

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

        // =====================================================
        // TIME OUT
        // =====================================================

        else
        {
            if (record is null ||
                !record.TimeIn.HasValue)
            {
                throw new InvalidOperationException(
                    "You must record Time In first.");
            }

            if (record.TimeOut.HasValue)
                throw new InvalidOperationException(
                    "You have already recorded your Time Out.");

            record.TimeOut = DateTime.UtcNow;
            record.Status = AttendanceStatus.Present;
            record.Method = "Manual";
        }

        await _context.SaveChangesAsync();
    }

    // =========================================================
    // GET BATCH ATTENDANCE
    // Trainer / Participant / Admin
    // =========================================================

    public async Task<IEnumerable<AttendanceRecordDto>>
        GetBatchAttendanceAsync(
            Guid batchId,
            Guid userId)
    {
        var batch =
            await _context.TrainingBatches
                .Include(x => x.TrainerAssignments)
                    .ThenInclude(x => x.TrainerProfile)
                .FirstOrDefaultAsync(
                    x => x.Id == batchId);

        if (batch is null)
            throw new KeyNotFoundException(
                "Training batch not found.");

        var isTrainer =
            batch.TrainerAssignments
                .Any(x =>
                    x.IsActive &&
                    x.TrainerProfile.UserId == userId);

        var isAdmin =
            await _context.Users
                .AnyAsync(x =>
                    x.Id == userId &&
                    x.Role == UserRole.Admin);

        var isParticipant =
            await _context.Enrollments
                .AnyAsync(x =>
                    x.TrainingBatchId == batchId &&
                    x.ParticipantProfile.UserId == userId);

        if (!isTrainer &&
            !isAdmin &&
            !isParticipant)
        {
            throw new UnauthorizedAccessException(
                "You are not authorized to view attendance for this training batch.");
        }

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