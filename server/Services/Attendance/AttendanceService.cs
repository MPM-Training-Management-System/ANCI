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

    public AttendanceService(
        ApplicationDbContext context)
    {
        _context = context;
    }

    // =========================================================
    // OPEN / START ATTENDANCE SESSION
    // Trainer
    //
    // IMPORTANT RULE:
    // - ONE TrainingSession = ONE AttendanceSession ONLY
    // - Once an AttendanceSession has been created,
    //   the same TrainingSession can NEVER create another one.
    //
    // Flow:
    //
    // TrainingSession
    //       ↓
    // Open Attendance
    //       ↓
    // AttendanceSession CREATED
    //       ↓
    // Close Attendance
    //       ↓
    // AttendanceSession = Closed
    //       ↓
    // Open again
    //       ↓
    // ERROR
    // =========================================================

    public async Task<Guid> OpenSessionAsync(
        Guid trainerUserId,
        OpenAttendanceRequest request)
    {
        if (request is null)
        {
            throw new ArgumentException(
                "Attendance request is required.");
        }

        // =====================================================
        // TRAINING SESSION
        // =====================================================

        var trainingSession =
            await _context.TrainingSessions
                .Include(x => x.TrainingBatch)
                    .ThenInclude(x =>
                        x.TrainerAssignments)
                    .ThenInclude(x =>
                        x.TrainerProfile)
                .FirstOrDefaultAsync(x =>
                    x.Id == request.TrainingSessionId &&
                    x.TrainingBatchId ==
                        request.TrainingBatchId);

        if (trainingSession is null)
        {
            throw new KeyNotFoundException(
                "Training session not found for this training batch.");
        }

        var batch =
            trainingSession.TrainingBatch;

        // =====================================================
        // TRAINER AUTHORIZATION
        // =====================================================

        var isAssignedTrainer =
            batch.TrainerAssignments.Any(x =>
                x.IsActive &&
                x.TrainerProfile.UserId ==
                    trainerUserId);

        if (!isAssignedTrainer)
        {
            throw new UnauthorizedAccessException(
                "You are not the assigned trainer for this training batch.");
        }

        // =====================================================
        // IMPORTANT:
        // ONE ATTENDANCE SESSION PER TRAINING SESSION
        //
        // DO NOT CHECK ONLY Status == Open.
        //
        // Even if the previous AttendanceSession is CLOSED,
        // it still means that this TrainingSession already
        // has its AttendanceSession.
        // =====================================================

        var existingAttendanceSession =
            await _context.AttendanceSessions
                .AnyAsync(x =>
                    x.TrainingBatchId ==
                        request.TrainingBatchId &&
                    x.TrainingSessionId ==
                        request.TrainingSessionId);

        if (existingAttendanceSession)
        {
            throw new InvalidOperationException(
                "An attendance session has already been created for this training session. It cannot be opened again.");
        }

        // =====================================================
        // CREATE ATTENDANCE SESSION
        // =====================================================

        var session =
            new AttendanceSession
            {
                Id = Guid.NewGuid(),

                TrainingBatchId =
                    request.TrainingBatchId,

                TrainingSessionId =
                    request.TrainingSessionId,

                OpenedAt =
                    DateTime.UtcNow,

                ClosedAt =
                    null,

                Status =
                    AttendanceSessionStatus.Open,

                // Starting the class does NOT automatically
                // open participant manual attendance.
                ManualAttendanceStatus =
                    ManualAttendanceStatus.Closed,

                OpenedByUserId =
                    trainerUserId
            };

        _context.AttendanceSessions.Add(session);

        await _context.SaveChangesAsync();

        return session.Id;
    }

    // =========================================================
    // CLOSE ATTENDANCE SESSION
    // Trainer
    //
    // IMPORTANT:
    // Closing does NOT delete the AttendanceSession.
    //
    // The AttendanceSession remains in the database with:
    //
    // Status = Closed
    //
    // Therefore OpenSessionAsync() will reject another
    // attempt to create a second session.
    // =========================================================

    public async Task CloseSessionAsync(
        Guid sessionId,
        Guid trainerUserId)
    {
        var session =
            await _context.AttendanceSessions
                .Include(x => x.TrainingBatch)
                    .ThenInclude(x =>
                        x.TrainerAssignments)
                    .ThenInclude(x =>
                        x.TrainerProfile)
                .FirstOrDefaultAsync(
                    x => x.Id == sessionId);

        if (session is null)
        {
            throw new KeyNotFoundException(
                "Attendance session not found.");
        }

        // =====================================================
        // TRAINER AUTHORIZATION
        // =====================================================

        var isAssignedTrainer =
            session.TrainingBatch
                .TrainerAssignments
                .Any(x =>
                    x.IsActive &&
                    x.TrainerProfile.UserId ==
                        trainerUserId);

        if (!isAssignedTrainer)
        {
            throw new UnauthorizedAccessException(
                "You are not the assigned trainer for this training batch.");
        }

        // =====================================================
        // ALREADY CLOSED
        // =====================================================

        if (session.Status ==
            AttendanceSessionStatus.Closed)
        {
            throw new InvalidOperationException(
                "Attendance session is already closed.");
        }

        // =====================================================
        // CLOSE SESSION
        // =====================================================

        session.Status =
            AttendanceSessionStatus.Closed;

        session.ClosedAt =
            DateTime.UtcNow;

        // Ending the class automatically closes
        // manual participant attendance.
        session.ManualAttendanceStatus =
            ManualAttendanceStatus.Closed;

        await _context.SaveChangesAsync();
    }

    // =========================================================
    // OPEN MANUAL ATTENDANCE
    // Trainer
    //
    // This is SEPARATE from opening the session.
    //
    // Requirements:
    // - AttendanceSession must be OPEN
    // =========================================================

    public async Task OpenManualAttendanceAsync(
        Guid sessionId,
        Guid trainerUserId)
    {
        var session =
            await GetSessionForTrainerAsync(
                sessionId,
                trainerUserId);

        // =====================================================
        // SESSION MUST BE OPEN
        // =====================================================

        if (session.Status !=
            AttendanceSessionStatus.Open)
        {
            throw new InvalidOperationException(
                "Training session must be open before opening manual attendance.");
        }

        // =====================================================
        // ALREADY OPEN
        // =====================================================

        if (session.ManualAttendanceStatus ==
            ManualAttendanceStatus.Open)
        {
            throw new InvalidOperationException(
                "Manual attendance is already open.");
        }

        session.ManualAttendanceStatus =
            ManualAttendanceStatus.Open;

        await _context.SaveChangesAsync();
    }

    // =========================================================
    // CLOSE MANUAL ATTENDANCE
    // Trainer
    //
    // Session itself remains OPEN.
    // QR scanning remains available.
    // =========================================================

    public async Task CloseManualAttendanceAsync(
        Guid sessionId,
        Guid trainerUserId)
    {
        var session =
            await GetSessionForTrainerAsync(
                sessionId,
                trainerUserId);

        // =====================================================
        // SESSION MUST STILL BE OPEN
        // =====================================================

        if (session.Status !=
            AttendanceSessionStatus.Open)
        {
            throw new InvalidOperationException(
                "Training session is already closed.");
        }

        // =====================================================
        // ALREADY CLOSED
        // =====================================================

        if (session.ManualAttendanceStatus ==
            ManualAttendanceStatus.Closed)
        {
            throw new InvalidOperationException(
                "Manual attendance is already closed.");
        }

        session.ManualAttendanceStatus =
            ManualAttendanceStatus.Closed;

        await _context.SaveChangesAsync();
    }

    // =========================================================
    // GET ATTENDANCE SESSION
    // Trainer / Participant / Admin
    // =========================================================

    public async Task<IEnumerable<AttendanceRecordDto>>
        GetSessionAsync(
            Guid sessionId,
            Guid userId)
    {
        var session =
            await _context.AttendanceSessions
                .Include(x => x.TrainingBatch)
                    .ThenInclude(x =>
                        x.TrainerAssignments)
                    .ThenInclude(x =>
                        x.TrainerProfile)
                .FirstOrDefaultAsync(
                    x => x.Id == sessionId);

        if (session is null)
        {
            throw new KeyNotFoundException(
                "Attendance session not found.");
        }

        // =====================================================
        // TRAINER
        // =====================================================

        var isTrainer =
            session.TrainingBatch
                .TrainerAssignments
                .Any(x =>
                    x.IsActive &&
                    x.TrainerProfile.UserId ==
                        userId);

        // =====================================================
        // ADMIN
        // =====================================================

        var isAdmin =
            await _context.Users
                .AnyAsync(x =>
                    x.Id == userId &&
                    x.Role == UserRole.Admin);

        // =====================================================
        // PARTICIPANT
        // =====================================================

        var isParticipant =
            await _context.Enrollments
                .AnyAsync(x =>
                    x.TrainingBatchId ==
                        session.TrainingBatchId &&
                    x.ParticipantProfile.UserId ==
                        userId);

        if (!isTrainer &&
            !isAdmin &&
            !isParticipant)
        {
            throw new UnauthorizedAccessException(
                "You are not authorized to view this attendance session.");
        }

        // =====================================================
        // RECORDS
        // =====================================================

        return await _context.AttendanceRecords
            .AsNoTracking()
            .Where(x =>
                x.AttendanceSessionId ==
                    sessionId)
            .Include(x => x.Enrollment)
                .ThenInclude(x =>
                    x.ParticipantProfile)
                    .ThenInclude(x =>
                        x.User)
            .Select(x =>
                new AttendanceRecordDto(
                    x.Id,
                    x.Enrollment
                        .ParticipantProfile
                        .User
                        .FullName,
                    x.TimeIn,
                    x.TimeOut,
                    x.Status.ToString(),
                    x.Method ?? string.Empty
                ))
            .ToListAsync();
    }

    // =========================================================
    // GET PERMANENT PARTICIPANT QR
    // Trainer / Participant
    //
    // QR does NOT expire.
    //
    // The QR can be displayed even when session is CLOSED.
    // Actual scanning is controlled by Session.Status.
    // =========================================================

    public async Task<AttendanceQrDto>
        GetQrAsync(
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
                    x => x.Id == sessionId);

        if (session is null)
        {
            throw new KeyNotFoundException(
                "Attendance session not found.");
        }

        // =====================================================
        // ENROLLMENT
        // =====================================================

        var enrollment =
            await _context.Enrollments
                .Include(x =>
                    x.ParticipantProfile)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == enrollmentId &&
                        x.TrainingBatchId ==
                            session.TrainingBatchId);

        if (enrollment is null)
        {
            throw new KeyNotFoundException(
                "Enrollment not found for this training batch.");
        }

        // =====================================================
        // APPROVED ONLY
        // =====================================================

        if (enrollment.Status !=
            EnrollmentStatus.Approved)
        {
            throw new InvalidOperationException(
                "Only approved participants have an attendance QR.");
        }

        // =====================================================
        // TRAINER AUTHORIZATION
        // =====================================================

        var isAssignedTrainer =
            session.TrainingBatch
                .TrainerAssignments
                .Any(x =>
                    x.IsActive &&
                    x.TrainerProfile.UserId ==
                        userId);

        // =====================================================
        // PARTICIPANT AUTHORIZATION
        // =====================================================

        var isParticipant =
            enrollment
                .ParticipantProfile
                .UserId ==
            userId;

        if (!isAssignedTrainer &&
            !isParticipant)
        {
            throw new UnauthorizedAccessException(
                "You are not authorized to access this attendance QR.");
        }

        // =====================================================
        // PERMANENT TOKEN
        // =====================================================

        if (string.IsNullOrWhiteSpace(
                enrollment.AttendanceToken))
        {
            throw new InvalidOperationException(
                "Attendance QR token has not been generated.");
        }

        // =====================================================
        // NO EXPIRATION
        // =====================================================

        return new AttendanceQrDto(
            session.Id,
            enrollment.Id,
            enrollment.AttendanceToken,
            DateTime.MaxValue);
    }

    // =========================================================
    // SCAN ATTENDANCE
    // Trainer
    //
    // FLOW:
    //
    // Trainer scans permanent participant QR
    //             ↓
    // Session must be OPEN
    //             ↓
    // Find enrollment using permanent token
    //             ↓
    // No record       = Time In
    // Time In only    = Time Out
    // Time In + Out   = Error
    //
    // ManualAttendanceStatus is NOT checked here.
    //
    // LATE RULE:
    // Actual TrainingSession scheduled start + 15 minutes
    // =========================================================

    public async Task ScanAttendanceAsync(
        Guid trainerUserId,
        ScanAttendanceRequest request)
    {
        if (request is null)
        {
            throw new ArgumentException(
                "Scan attendance request is required.");
        }

        // =====================================================
        // SESSION
        // =====================================================

        var session =
            await _context.AttendanceSessions
                .Include(x => x.TrainingSession)
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
        {
            throw new KeyNotFoundException(
                "Attendance session not found.");
        }

        // =====================================================
        // TRAINER CHECK
        // =====================================================

        var isAssignedTrainer =
            session.TrainingBatch
                .TrainerAssignments
                .Any(x =>
                    x.IsActive &&
                    x.TrainerProfile.UserId ==
                        trainerUserId);

        if (!isAssignedTrainer)
        {
            throw new UnauthorizedAccessException(
                "You are not the assigned trainer for this training batch.");
        }

        // =====================================================
        // SESSION MUST BE OPEN
        //
        // IMPORTANT:
        // ManualAttendanceStatus is NOT checked.
        // =====================================================

        if (session.Status !=
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
        {
            throw new UnauthorizedAccessException(
                "Invalid attendance QR.");
        }

        // =====================================================
        // SAME BATCH
        // =====================================================

        if (enrollment.TrainingBatchId !=
            session.TrainingBatchId)
        {
            throw new UnauthorizedAccessException(
                "Participant does not belong to this training batch.");
        }

        // =====================================================
        // APPROVED ONLY
        // =====================================================

        if (enrollment.Status !=
            EnrollmentStatus.Approved)
        {
            throw new InvalidOperationException(
                "Only approved participants can record attendance.");
        }

        // =====================================================
        // TRAINING SESSION
        // =====================================================

        var trainingSession =
            session.TrainingSession;

        if (trainingSession is null)
        {
            throw new KeyNotFoundException(
                "Training session not found.");
        }

        // =====================================================
        // ATTENDANCE TIME
        // =====================================================

        var now =
            GetPhilippineNow();

        var today =
            DateOnly.FromDateTime(now);

        // =====================================================
        // SCHEDULED START
        //
        // Late is based on the actual scheduled class time,
        // NOT the time the trainer clicked Open Attendance.
        //
        // Example:
        //
        // Scheduled Start: 9:00 AM
        // Grace Period:    15 minutes
        //
        // 9:00 - 9:15  = Present
        // After 9:15    = Late
        // =====================================================

        var scheduledStart =
            trainingSession.SessionDate.Date
                .Add(
                    trainingSession.StartTime
                        .ToTimeSpan());

        var lateThreshold =
            scheduledStart.AddMinutes(15);

        var attendanceStatus =
            now > lateThreshold
                ? AttendanceStatus.Late
                : AttendanceStatus.Present;

        // =====================================================
        // FIND EXISTING RECORD
        // =====================================================

        var existingRecord =
            await _context.AttendanceRecords
                .FirstOrDefaultAsync(
                    x =>
                        x.EnrollmentId ==
                            enrollment.Id &&
                        x.AttendanceSessionId ==
                            session.Id);

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

                    AttendanceDate =
                        today,

                    TimeIn =
                        DateTime.UtcNow,

                    TimeOut =
                        null,

                    Status =
                        attendanceStatus,

                    Method =
                        "QR"
                };

            _context.AttendanceRecords
                .Add(record);

            await _context.SaveChangesAsync();

            return;
        }

        // =====================================================
        // SECOND SCAN = TIME OUT
        // =====================================================

        if (existingRecord.TimeIn.HasValue &&
            !existingRecord.TimeOut.HasValue)
        {
            existingRecord.TimeOut =
                DateTime.UtcNow;

            // Preserve Late status.
            // If participant was Present during Time In,
            // keep Present.
            if (existingRecord.Status !=
                AttendanceStatus.Late)
            {
                existingRecord.Status =
                    AttendanceStatus.Present;
            }

            existingRecord.Method =
                "QR";

            await _context.SaveChangesAsync();

            return;
        }

        // =====================================================
        // THIRD SCAN = COMPLETE
        // =====================================================

        if (existingRecord.TimeOut.HasValue)
        {
            throw new InvalidOperationException(
                "Participant has already completed attendance for this training session.");
        }
    }

    // =========================================================
    // MANUAL ATTENDANCE
    // Participant
    //
    // Requirements:
    // 1. Session OPEN
    // 2. Manual Attendance OPEN
    // 3. Participant enrolled
    // 4. Enrollment approved
    //
    // One AttendanceRecord per:
    // Enrollment + AttendanceSession
    // =========================================================

    public async Task ManualAttendanceAsync(
        Guid participantUserId,
        ManualAttendanceRequest request)
    {
        if (request is null)
        {
            throw new ArgumentException(
                "Attendance request is required.");
        }

        // =====================================================
        // NORMALIZE ACTION
        // =====================================================

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

        // =====================================================
        // SESSION
        // =====================================================

        var session =
            await _context.AttendanceSessions
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        request.AttendanceSessionId);

        if (session is null)
        {
            throw new KeyNotFoundException(
                "Attendance session not found.");
        }

        // =====================================================
        // SESSION MUST BE OPEN
        // =====================================================

        if (session.Status !=
            AttendanceSessionStatus.Open)
        {
            throw new InvalidOperationException(
                "Training session is currently closed.");
        }

        // =====================================================
        // MANUAL ATTENDANCE MUST BE OPEN
        // =====================================================

        if (session.ManualAttendanceStatus !=
            ManualAttendanceStatus.Open)
        {
            throw new InvalidOperationException(
                "Manual attendance is currently closed.");
        }

        // =====================================================
        // FIND PARTICIPANT ENROLLMENT
        // =====================================================

        var enrollment =
            await _context.Enrollments
                .Include(x =>
                    x.ParticipantProfile)
                .FirstOrDefaultAsync(
                    x =>
                        x.TrainingBatchId ==
                            session.TrainingBatchId &&
                        x.ParticipantProfile.UserId ==
                            participantUserId);

        if (enrollment is null)
        {
            throw new UnauthorizedAccessException(
                "You are not enrolled in this training batch.");
        }

        // =====================================================
        // APPROVED ONLY
        // =====================================================

        if (enrollment.Status !=
            EnrollmentStatus.Approved)
        {
            throw new InvalidOperationException(
                "Only approved participants can record attendance.");
        }

        // =====================================================
        // CURRENT TIME
        // =====================================================

        var now =
            GetPhilippineNow();

        var today =
            DateOnly.FromDateTime(now);

        // =====================================================
        // TRAINING SESSION
        // =====================================================

        var trainingSession =
            await _context.TrainingSessions
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        session.TrainingSessionId);

        if (trainingSession is null)
        {
            throw new KeyNotFoundException(
                "Training session not found.");
        }

        // =====================================================
        // SCHEDULED START
        // =====================================================

        var scheduledStart =
            trainingSession.SessionDate.Date
                .Add(
                    trainingSession.StartTime
                        .ToTimeSpan());

        var lateThreshold =
            scheduledStart.AddMinutes(15);

        var attendanceStatus =
            now > lateThreshold
                ? AttendanceStatus.Late
                : AttendanceStatus.Present;

        // =====================================================
        // FIND EXISTING RECORD
        //
        // Same record can be created by QR or Manual.
        // =====================================================

        var record =
            await _context.AttendanceRecords
                .FirstOrDefaultAsync(
                    x =>
                        x.EnrollmentId ==
                            enrollment.Id &&
                        x.AttendanceSessionId ==
                            session.Id);

        // =====================================================
        // TIME IN
        // =====================================================

        if (action == "timein")
        {
            // Already has Time In.
            if (record is not null &&
                record.TimeIn.HasValue)
            {
                if (record.TimeOut.HasValue)
                {
                    throw new InvalidOperationException(
                        "You have already completed attendance for this training session.");
                }

                throw new InvalidOperationException(
                    "You have already recorded your Time In.");
            }

            // No record yet.
            if (record is null)
            {
                record =
                    new AttendanceRecord
                    {
                        Id = Guid.NewGuid(),

                        AttendanceSessionId =
                            session.Id,

                        EnrollmentId =
                            enrollment.Id,

                        AttendanceDate =
                            today,

                        TimeIn =
                            DateTime.UtcNow,

                        TimeOut =
                            null,

                        Status =
                            attendanceStatus,

                        Method =
                            "Manual"
                    };

                _context.AttendanceRecords
                    .Add(record);
            }
            else
            {
                // Existing record without Time In.
                record.TimeIn =
                    DateTime.UtcNow;

                record.Status =
                    attendanceStatus;

                record.Method =
                    "Manual";

                record.AttendanceSessionId =
                    session.Id;
            }
        }

        // =====================================================
        // TIME OUT
        // =====================================================

        else
        {
            // Must have Time In first.
            if (record is null ||
                !record.TimeIn.HasValue)
            {
                throw new InvalidOperationException(
                    "You must record Time In first.");
            }

            // Already timed out.
            if (record.TimeOut.HasValue)
            {
                throw new InvalidOperationException(
                    "You have already completed attendance for this training session.");
            }

            record.TimeOut =
                DateTime.UtcNow;

            // Preserve Late status.
            if (record.Status !=
                AttendanceStatus.Late)
            {
                record.Status =
                    AttendanceStatus.Present;
            }

            record.Method =
                "Manual";

            record.AttendanceSessionId =
                session.Id;
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
                .Include(x =>
                    x.TrainerAssignments)
                    .ThenInclude(x =>
                        x.TrainerProfile)
                .FirstOrDefaultAsync(
                    x => x.Id == batchId);

        if (batch is null)
        {
            throw new KeyNotFoundException(
                "Training batch not found.");
        }

        // =====================================================
        // TRAINER
        // =====================================================

        var isTrainer =
            batch.TrainerAssignments
                .Any(x =>
                    x.IsActive &&
                    x.TrainerProfile.UserId ==
                        userId);

        // =====================================================
        // ADMIN
        // =====================================================

        var isAdmin =
            await _context.Users
                .AnyAsync(x =>
                    x.Id == userId &&
                    x.Role == UserRole.Admin);

        // =====================================================
        // PARTICIPANT
        // =====================================================

        var isParticipant =
            await _context.Enrollments
                .AnyAsync(x =>
                    x.TrainingBatchId ==
                        batchId &&
                    x.ParticipantProfile.UserId ==
                        userId);

        if (!isTrainer &&
            !isAdmin &&
            !isParticipant)
        {
            throw new UnauthorizedAccessException(
                "You are not authorized to view attendance for this training batch.");
        }

        // =====================================================
        // RECORDS
        // =====================================================

        return await _context.AttendanceRecords
            .AsNoTracking()
            .Where(x =>
                x.AttendanceSession.TrainingBatchId ==
                    batchId)
            .Include(x =>
                x.Enrollment)
                .ThenInclude(x =>
                    x.ParticipantProfile)
                    .ThenInclude(x =>
                        x.User)
            .Select(x =>
                new AttendanceRecordDto(
                    x.Id,
                    x.Enrollment
                        .ParticipantProfile
                        .User
                        .FullName,
                    x.TimeIn,
                    x.TimeOut,
                    x.Status.ToString(),
                    x.Method ?? string.Empty
                ))
            .ToListAsync();
    }

    // =========================================================
    // GET OPEN SESSION ID
    //
    // Returns ONLY the OPEN AttendanceSession.
    //
    // IMPORTANT:
    // If a session already exists but is CLOSED,
    // this returns null.
    //
    // This does NOT create another AttendanceSession.
    // =========================================================

    public async Task<Guid?> GetOpenSessionIdAsync(
        Guid batchId,
        Guid trainingSessionId,
        Guid userId)
    {
        var batch =
            await _context.TrainingBatches
                .Include(x =>
                    x.TrainerAssignments)
                    .ThenInclude(x =>
                        x.TrainerProfile)
                .FirstOrDefaultAsync(
                    x => x.Id == batchId);

        if (batch is null)
        {
            return null;
        }

        // =====================================================
        // TRAINER / PARTICIPANT / ADMIN AUTHORIZATION
        // =====================================================

        var isTrainer =
            batch.TrainerAssignments.Any(x =>
                x.IsActive &&
                x.TrainerProfile.UserId ==
                    userId);

        var isAdmin =
            await _context.Users
                .AnyAsync(x =>
                    x.Id == userId &&
                    x.Role == UserRole.Admin);

        var isParticipant =
            await _context.Enrollments
                .AnyAsync(x =>
                    x.TrainingBatchId ==
                        batchId &&
                    x.ParticipantProfile.UserId ==
                        userId);

        if (!isTrainer &&
            !isAdmin &&
            !isParticipant)
        {
            return null;
        }

        // =====================================================
        // VERIFY TRAINING SESSION
        // =====================================================

        var trainingSessionExists =
            await _context.TrainingSessions
                .AnyAsync(x =>
                    x.Id == trainingSessionId &&
                    x.TrainingBatchId == batchId);

        if (!trainingSessionExists)
        {
            return null;
        }

        // =====================================================
        // FIND OPEN ATTENDANCE
        // =====================================================

        var session =
            await _context.AttendanceSessions
                .Where(x =>
                    x.TrainingBatchId == batchId &&
                    x.TrainingSessionId ==
                        trainingSessionId &&
                    x.Status ==
                        AttendanceSessionStatus.Open)
                .FirstOrDefaultAsync();

        return session?.Id;
    }

    // =========================================================
    // GET OPEN SESSION
    //
    // Returns:
    //
    // IsOpen
    // AttendanceSessionId
    // ManualAttendanceOpen
    //
    // If the session was already CLOSED:
    //
    // IsOpen = false
    // AttendanceSessionId = null
    //
    // The frontend can then know that the session is finished.
    // =========================================================

    public async Task<OpenAttendanceSessionDto>
        GetOpenSessionAsync(
            Guid batchId,
            Guid trainingSessionId,
            Guid userId)
    {
        var batch =
            await _context.TrainingBatches
                .Include(x =>
                    x.TrainerAssignments)
                    .ThenInclude(x =>
                        x.TrainerProfile)
                .FirstOrDefaultAsync(
                    x => x.Id == batchId);

        if (batch is null)
        {
            throw new KeyNotFoundException(
                "Training batch not found.");
        }

        // =====================================================
        // AUTHORIZATION
        // =====================================================

        var isTrainer =
            batch.TrainerAssignments.Any(x =>
                x.IsActive &&
                x.TrainerProfile.UserId ==
                    userId);

        var isAdmin =
            await _context.Users
                .AnyAsync(x =>
                    x.Id == userId &&
                    x.Role == UserRole.Admin);

        var isParticipant =
            await _context.Enrollments
                .AnyAsync(x =>
                    x.TrainingBatchId ==
                        batchId &&
                    x.ParticipantProfile.UserId ==
                        userId);

        if (!isTrainer &&
            !isAdmin &&
            !isParticipant)
        {
            throw new UnauthorizedAccessException(
                "You are not authorized to view attendance for this training batch.");
        }

        // =====================================================
        // VERIFY TRAINING SESSION
        // =====================================================

        var trainingSessionExists =
            await _context.TrainingSessions
                .AnyAsync(x =>
                    x.Id == trainingSessionId &&
                    x.TrainingBatchId == batchId);

        if (!trainingSessionExists)
        {
            throw new KeyNotFoundException(
                "Training session not found for this training batch.");
        }

        // =====================================================
        // FIND OPEN ATTENDANCE
        // =====================================================

        var session =
            await _context.AttendanceSessions
                .Where(x =>
                    x.TrainingBatchId == batchId &&
                    x.TrainingSessionId ==
                        trainingSessionId &&
                    x.Status ==
                        AttendanceSessionStatus.Open)
                .FirstOrDefaultAsync();

        // =====================================================
        // NO OPEN SESSION
        // =====================================================

        if (session is null)
        {
            return new OpenAttendanceSessionDto(
                false,
                null,
                false);
        }

        // =====================================================
        // OPEN SESSION
        // =====================================================

        return new OpenAttendanceSessionDto(
            true,
            session.Id,
            session.ManualAttendanceStatus ==
                ManualAttendanceStatus.Open);
    }

  // =========================================================
// PHILIPPINE TIME
// =========================================================

private static TimeZoneInfo GetPhilippineTimeZone()
{
    // Linux / Render / Azure
    try
    {
        return TimeZoneInfo.FindSystemTimeZoneById(
            "Asia/Manila");
    }
    catch (TimeZoneNotFoundException)
    {
        // Windows
        return TimeZoneInfo.FindSystemTimeZoneById(
            "Singapore Standard Time");
    }
}

// =========================================================
// GET CURRENT PHILIPPINE TIME
// =========================================================

private static DateTime GetPhilippineNow()
{
    var utcNow =
        DateTime.UtcNow;

    var philippinesTimeZone =
        GetPhilippineTimeZone();

    return TimeZoneInfo.ConvertTimeFromUtc(
        utcNow,
        philippinesTimeZone);
}

    private async Task<AttendanceSession>
        GetSessionForTrainerAsync(
            Guid sessionId,
            Guid trainerUserId)
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
                    x => x.Id == sessionId);

        if (session is null)
        {
            throw new KeyNotFoundException(
                "Attendance session not found.");
        }

        var isAssignedTrainer =
            session.TrainingBatch
                .TrainerAssignments
                .Any(x =>
                    x.IsActive &&
                    x.TrainerProfile.UserId ==
                        trainerUserId);

        if (!isAssignedTrainer)
        {
            throw new UnauthorizedAccessException(
                "You are not the assigned trainer for this training batch.");
        }

        return session;
    }

    // =========================================================
    // GET TRAINER ATTENDANCE PROGRESS
    //
    // Returns attendance progress for participants enrolled
    // in training batches assigned to the logged-in trainer.
    //
    // Trainer scope:
    // TrainerAssignments.IsActive == true
    //
    // Attendance:
    // Present / Late = Attended
    // Absent         = Absent
    // =========================================================

    public async Task<IEnumerable<AttendanceProgressDto>>
        GetTrainerAttendanceProgressAsync(
            Guid trainerUserId)
    {
        // =====================================================
        // GET TRAINING BATCHES ASSIGNED TO THIS TRAINER
        // =====================================================

        var trainerBatchIds =
            await _context.TrainingBatches
                .AsNoTracking()
                .Where(batch =>
                    batch.TrainerAssignments.Any(assignment =>
                        assignment.IsActive &&
                        assignment.TrainerProfile.UserId ==
                            trainerUserId))
                .Select(batch => batch.Id)
                .ToListAsync();

        if (trainerBatchIds.Count == 0)
        {
            return [];
        }

        // =====================================================
        // GET APPROVED ENROLLMENTS
        // =====================================================

        var enrollments =
            await _context.Enrollments
                .AsNoTracking()
                .Where(enrollment =>
                    trainerBatchIds.Contains(
                        enrollment.TrainingBatchId) &&
                    enrollment.Status ==
                        EnrollmentStatus.Approved)
                .Include(enrollment =>
                    enrollment.ParticipantProfile)
                .ThenInclude(profile =>
                    profile.User)
                .ToListAsync();

        if (enrollments.Count == 0)
        {
            return [];
        }

        // =====================================================
        // GET TOTAL SCHEDULED SESSIONS PER BATCH
        //
        // Training sessions are the actual approved schedule.
        // =====================================================

        var sessionCounts =
            await _context.TrainingSessions
                .AsNoTracking()
                .Where(session =>
                    trainerBatchIds.Contains(
                        session.TrainingBatchId))
                .GroupBy(session =>
                    session.TrainingBatchId)
                .Select(group => new
                {
                    TrainingBatchId =
                        group.Key,

                    TotalSessions =
                        group.Count()
                })
                .ToDictionaryAsync(
                    x => x.TrainingBatchId,
                    x => x.TotalSessions);

        // =====================================================
        // GET ATTENDANCE RECORDS
        // =====================================================

        var enrollmentIds =
            enrollments
                .Select(x => x.Id)
                .ToList();

        var attendanceRecords =
            await _context.AttendanceRecords
                .AsNoTracking()
                .Where(record =>
                    enrollmentIds.Contains(
                        record.EnrollmentId))
                .Select(record => new
                {
                    record.EnrollmentId,
                    record.Status
                })
                .ToListAsync();

        // =====================================================
        // BUILD PROGRESS
        // =====================================================

        var result =
            new List<AttendanceProgressDto>();

        foreach (var enrollment in enrollments)
        {
            var records =
                attendanceRecords
                    .Where(record =>
                        record.EnrollmentId ==
                            enrollment.Id)
                    .ToList();

            var totalSessions =
                sessionCounts.TryGetValue(
                    enrollment.TrainingBatchId,
                    out var count)
                    ? count
                    : 0;

            var attendedSessions =
                records.Count(record =>
                    record.Status ==
                        AttendanceStatus.Present ||
                    record.Status ==
                        AttendanceStatus.Late ||
                    record.Status ==
                        AttendanceStatus.TimeInOnly ||
                    record.Status ==
                        AttendanceStatus.TimeOutOnly);

            var lateSessions =
                records.Count(record =>
                    record.Status ==
                        AttendanceStatus.Late);

            var absentSessions =
                records.Count(record =>
                    record.Status ==
                        AttendanceStatus.Absent);

            var attendancePercentage =
                totalSessions > 0
                    ? decimal.Round(
                        (decimal)attendedSessions /
                        totalSessions *
                        100m,
                        2,
                        MidpointRounding.AwayFromZero)
                    : 0m;

            result.Add(
                new AttendanceProgressDto(
                    EnrollmentId:
                        enrollment.Id,

                    TrainingBatchId:
                        enrollment.TrainingBatchId,

                    ParticipantName:
                        enrollment
                            .ParticipantProfile
                            .User
                            .FullName,

                    TotalSessions:
                        totalSessions,

                    AttendedSessions:
                        attendedSessions,

                    LateSessions:
                        lateSessions,

                    AbsentSessions:
                        absentSessions,

                    AttendancePercentage:
                        attendancePercentage
                )
            );
        }

        return result
            .OrderBy(x => x.ParticipantName)
            .ToList();
    }
}