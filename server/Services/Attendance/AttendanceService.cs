
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Attendance;
using server.Enums;
using server.Interfaces;
using server.Interfaces.Attendance;
using server.Models.Attendance;

namespace server.Services.Attendance;

public class AttendanceService : IAttendanceService
{
    private readonly ApplicationDbContext _context;
    private readonly ICacheService _cache;

    private const string AttendanceCachePrefix = "attendance:";
    private static readonly TimeSpan CacheDuration =
        TimeSpan.FromMinutes(2);

    public AttendanceService(
        ApplicationDbContext context,
        ICacheService cache)
    {
        _context = context;
        _cache = cache;
    }

    // =========================================================
    // CACHE HELPERS
    // =========================================================

    private void InvalidateAttendanceCache()
    {
        _cache.RemoveByPrefix(AttendanceCachePrefix);
    }

    // =========================================================
    // OPEN ATTENDANCE SESSION
    // =========================================================

    public async Task<Guid> OpenSessionAsync(
        Guid trainerUserId,
        OpenAttendanceRequest request)
    {
        if (request is null)
            throw new ArgumentException(
                "Attendance request is required.");

        var trainingSession = await _context.TrainingSessions
            .Include(x => x.TrainingBatch)
                .ThenInclude(x => x.TrainerAssignments)
                .ThenInclude(x => x.TrainerProfile)
            .FirstOrDefaultAsync(x =>
                x.Id == request.TrainingSessionId &&
                x.TrainingBatchId == request.TrainingBatchId);

        if (trainingSession is null)
            throw new KeyNotFoundException(
                "Training session not found for this training batch.");

        var isAssignedTrainer = trainingSession.TrainingBatch
            .TrainerAssignments
            .Any(x =>
                x.IsActive &&
                x.TrainerProfile.UserId == trainerUserId);

        if (!isAssignedTrainer)
            throw new UnauthorizedAccessException(
                "You are not the assigned trainer for this training batch.");

        var alreadyExists = await _context.AttendanceSessions
            .AnyAsync(x =>
                x.TrainingBatchId == request.TrainingBatchId &&
                x.TrainingSessionId == request.TrainingSessionId);

        if (alreadyExists)
            throw new InvalidOperationException(
                "An attendance session has already been created for this training session. It cannot be opened again.");

        var session = new AttendanceSession
        {
            Id = Guid.NewGuid(),
            TrainingBatchId = request.TrainingBatchId,
            TrainingSessionId = request.TrainingSessionId,
            OpenedAt = DateTime.UtcNow,
            ClosedAt = null,
            Status = AttendanceSessionStatus.Open,
            ManualAttendanceStatus = ManualAttendanceStatus.Closed,
            OpenedByUserId = trainerUserId
        };

        _context.AttendanceSessions.Add(session);
        await _context.SaveChangesAsync();

        InvalidateAttendanceCache();

        return session.Id;
    }

    // =========================================================
    // CLOSE ATTENDANCE SESSION
    // =========================================================

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

        var incompleteRecords = await _context.AttendanceRecords
            .Where(x =>
                x.AttendanceSessionId == sessionId &&
                x.TimeIn.HasValue &&
                !x.TimeOut.HasValue)
            .ToListAsync();

        foreach (var record in incompleteRecords)
        {
            record.Status = AttendanceStatus.Late;
        }

        session.Status = AttendanceSessionStatus.Closed;
        session.ClosedAt = DateTime.UtcNow;
        session.ManualAttendanceStatus = ManualAttendanceStatus.Closed;

        await _context.SaveChangesAsync();

        InvalidateAttendanceCache();
    }

    // =========================================================
    // OPEN MANUAL ATTENDANCE
    // =========================================================

    public async Task OpenManualAttendanceAsync(
        Guid sessionId,
        Guid trainerUserId)
    {
        var session = await GetSessionForTrainerAsync(
            sessionId,
            trainerUserId);

        if (session.Status != AttendanceSessionStatus.Open)
            throw new InvalidOperationException(
                "Training session must be open before opening manual attendance.");

        if (session.ManualAttendanceStatus ==
            ManualAttendanceStatus.Open)
        {
            throw new InvalidOperationException(
                "Manual attendance is already open.");
        }

        session.ManualAttendanceStatus = ManualAttendanceStatus.Open;

        await _context.SaveChangesAsync();

        InvalidateAttendanceCache();
    }

    // =========================================================
    // CLOSE MANUAL ATTENDANCE
    // =========================================================

    public async Task CloseManualAttendanceAsync(
        Guid sessionId,
        Guid trainerUserId)
    {
        var session = await GetSessionForTrainerAsync(
            sessionId,
            trainerUserId);

        if (session.Status != AttendanceSessionStatus.Open)
            throw new InvalidOperationException(
                "Training session is already closed.");

        if (session.ManualAttendanceStatus ==
            ManualAttendanceStatus.Closed)
        {
            throw new InvalidOperationException(
                "Manual attendance is already closed.");
        }

        session.ManualAttendanceStatus = ManualAttendanceStatus.Closed;

        var incompleteRecords = await _context.AttendanceRecords
            .Where(x =>
                x.AttendanceSessionId == sessionId &&
                x.Method == "Manual" &&
                x.TimeIn.HasValue &&
                !x.TimeOut.HasValue)
            .ToListAsync();

        foreach (var record in incompleteRecords)
        {
            record.Status = AttendanceStatus.Late;
        }

        await _context.SaveChangesAsync();

        InvalidateAttendanceCache();
    }

    // =========================================================
    // GET ATTENDANCE SESSION
    // =========================================================

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

        var isTrainer = session.TrainingBatch.TrainerAssignments.Any(x =>
            x.IsActive &&
            x.TrainerProfile.UserId == userId);

        var isAdmin = await _context.Users.AnyAsync(x =>
            x.Id == userId &&
            x.Role == UserRole.Admin);

        var isParticipant = await _context.Enrollments.AnyAsync(x =>
            x.TrainingBatchId == session.TrainingBatchId &&
            x.ParticipantProfile.UserId == userId);

        if (!isTrainer && !isAdmin && !isParticipant)
            throw new UnauthorizedAccessException(
                "You are not authorized to view this attendance session.");

        var cacheKey = $"{AttendanceCachePrefix}session:{sessionId}";

        if (_cache.TryGet<List<AttendanceRecordDto>>(
                cacheKey,
                out var cachedRecords) &&
            cachedRecords is not null)
        {
            return cachedRecords;
        }

        var records = await _context.AttendanceRecords
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
                x.Method ?? string.Empty))
            .ToListAsync();

        _cache.Set(cacheKey, records, CacheDuration);

        return records;
    }

    // =========================================================
    // GET PERMANENT PARTICIPANT QR
    // =========================================================

    public async Task<AttendanceQrDto> GetQrAsync(
        Guid sessionId,
        Guid enrollmentId,
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

        var enrollment = await _context.Enrollments
            .Include(x => x.ParticipantProfile)
            .FirstOrDefaultAsync(x =>
                x.Id == enrollmentId &&
                x.TrainingBatchId == session.TrainingBatchId);

        if (enrollment is null)
            throw new KeyNotFoundException(
                "Enrollment not found for this training batch.");

        if (enrollment.Status != EnrollmentStatus.Approved)
            throw new InvalidOperationException(
                "Only approved participants have an attendance QR.");

        var isAssignedTrainer = session.TrainingBatch.TrainerAssignments.Any(x =>
            x.IsActive &&
            x.TrainerProfile.UserId == userId);

        var isParticipant =
            enrollment.ParticipantProfile.UserId == userId;

        if (!isAssignedTrainer && !isParticipant)
            throw new UnauthorizedAccessException(
                "You are not authorized to access this attendance QR.");

        if (string.IsNullOrWhiteSpace(enrollment.AttendanceToken))
            throw new InvalidOperationException(
                "Attendance QR token has not been generated.");

        return new AttendanceQrDto(
            session.Id,
            enrollment.Id,
            enrollment.AttendanceToken,
            DateTime.MaxValue);
    }

    // =========================================================
    // SCAN ATTENDANCE
    // =========================================================

    public async Task ScanAttendanceAsync(
        Guid trainerUserId,
        ScanAttendanceRequest request)
    {
        if (request is null)
            throw new ArgumentException(
                "Scan attendance request is required.");

        var session = await _context.AttendanceSessions
            .Include(x => x.TrainingSession)
            .Include(x => x.TrainingBatch)
                .ThenInclude(x => x.TrainerAssignments)
                .ThenInclude(x => x.TrainerProfile)
            .FirstOrDefaultAsync(x =>
                x.Id == request.AttendanceSessionId);

        if (session is null)
            throw new KeyNotFoundException(
                "Attendance session not found.");

        var isAssignedTrainer = session.TrainingBatch.TrainerAssignments.Any(x =>
            x.IsActive &&
            x.TrainerProfile.UserId == trainerUserId);

        if (!isAssignedTrainer)
            throw new UnauthorizedAccessException(
                "You are not the assigned trainer for this training batch.");

        if (session.Status != AttendanceSessionStatus.Open)
            throw new InvalidOperationException(
                "Attendance session is currently closed.");

        var enrollment = await _context.Enrollments
            .Include(x => x.ParticipantProfile)
            .FirstOrDefaultAsync(x =>
                x.AttendanceToken == request.Token);

        if (enrollment is null)
            throw new UnauthorizedAccessException(
                "Invalid attendance QR.");

        if (enrollment.TrainingBatchId != session.TrainingBatchId)
            throw new UnauthorizedAccessException(
                "Participant does not belong to this training batch.");

        if (enrollment.Status != EnrollmentStatus.Approved)
            throw new InvalidOperationException(
                "Only approved participants can record attendance.");

        if (session.TrainingSession is null)
            throw new KeyNotFoundException(
                "Training session not found.");

        var nowUtc = DateTime.UtcNow;
        var nowPhilippine = ConvertUtcToPhilippineTime(nowUtc);
        var today = DateOnly.FromDateTime(nowPhilippine);

        var existingRecord = await _context.AttendanceRecords
            .FirstOrDefaultAsync(x =>
                x.EnrollmentId == enrollment.Id &&
                x.AttendanceSessionId == session.Id);

        if (existingRecord is null)
        {
            var status = CalculateAttendanceStatus(
                session.OpenedAt,
                nowUtc);

            var record = new AttendanceRecord
            {
                Id = Guid.NewGuid(),
                AttendanceSessionId = session.Id,
                EnrollmentId = enrollment.Id,
                AttendanceDate = today,
                TimeIn = nowUtc,
                TimeOut = null,
                Status = status,
                Method = "QR"
            };

            _context.AttendanceRecords.Add(record);

            await _context.SaveChangesAsync();

            InvalidateAttendanceCache();

            return;
        }

        if (existingRecord.TimeIn.HasValue &&
            !existingRecord.TimeOut.HasValue)
        {
            existingRecord.TimeOut = nowUtc;
            existingRecord.Method = "QR";

            await _context.SaveChangesAsync();

            InvalidateAttendanceCache();

            return;
        }

        if (existingRecord.TimeOut.HasValue)
            throw new InvalidOperationException(
                "Participant has already completed attendance for this training session.");
    }

    // =========================================================
    // MANUAL ATTENDANCE
    // =========================================================

    public async Task ManualAttendanceAsync(
        Guid participantUserId,
        ManualAttendanceRequest request)
    {
        if (request is null)
            throw new ArgumentException(
                "Attendance request is required.");

        var action = request.Action.Trim().ToLowerInvariant();

        if (action != "timein" && action != "timeout")
            throw new ArgumentException(
                "Action must be TimeIn or TimeOut.");

        var session = await _context.AttendanceSessions
            .FirstOrDefaultAsync(x =>
                x.Id == request.AttendanceSessionId);

        if (session is null)
            throw new KeyNotFoundException(
                "Attendance session not found.");

        if (session.Status != AttendanceSessionStatus.Open)
            throw new InvalidOperationException(
                "Training session is currently closed.");

        if (session.ManualAttendanceStatus !=
            ManualAttendanceStatus.Open)
        {
            throw new InvalidOperationException(
                "Manual attendance is currently closed.");
        }

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

        var nowUtc = DateTime.UtcNow;
        var nowPhilippine = ConvertUtcToPhilippineTime(nowUtc);
        var today = DateOnly.FromDateTime(nowPhilippine);

        var record = await _context.AttendanceRecords
            .FirstOrDefaultAsync(x =>
                x.EnrollmentId == enrollment.Id &&
                x.AttendanceSessionId == session.Id);

        if (action == "timein")
        {
            if (record is not null && record.TimeIn.HasValue)
            {
                if (record.TimeOut.HasValue)
                    throw new InvalidOperationException(
                        "You have already completed attendance for this training session.");

                throw new InvalidOperationException(
                    "You have already recorded your Time In.");
            }

            var status = CalculateAttendanceStatus(
                session.OpenedAt,
                nowUtc);

            if (record is null)
            {
                record = new AttendanceRecord
                {
                    Id = Guid.NewGuid(),
                    AttendanceSessionId = session.Id,
                    EnrollmentId = enrollment.Id,
                    AttendanceDate = today,
                    TimeIn = nowUtc,
                    TimeOut = null,
                    Status = status,
                    Method = "Manual"
                };

                _context.AttendanceRecords.Add(record);
            }
            else
            {
                record.TimeIn = nowUtc;
                record.Status = status;
                record.Method = "Manual";
                record.AttendanceDate = today;
            }
        }
        else
        {
            if (record is null || !record.TimeIn.HasValue)
                throw new InvalidOperationException(
                    "You must record Time In first.");

            if (record.TimeOut.HasValue)
                throw new InvalidOperationException(
                    "You have already completed attendance for this training session.");

            record.TimeOut = nowUtc;
            record.Method = "Manual";
        }

        await _context.SaveChangesAsync();

        InvalidateAttendanceCache();
    }

    // =========================================================
    // GET BATCH ATTENDANCE
    // =========================================================

    public async Task<IEnumerable<AttendanceRecordDto>>
        GetBatchAttendanceAsync(Guid batchId, Guid userId)
    {
        var batch = await _context.TrainingBatches
            .Include(x => x.TrainerAssignments)
                .ThenInclude(x => x.TrainerProfile)
            .FirstOrDefaultAsync(x => x.Id == batchId);

        if (batch is null)
            throw new KeyNotFoundException(
                "Training batch not found.");

        var isTrainer = batch.TrainerAssignments.Any(x =>
            x.IsActive &&
            x.TrainerProfile.UserId == userId);

        var isAdmin = await _context.Users.AnyAsync(x =>
            x.Id == userId &&
            x.Role == UserRole.Admin);

        var isParticipant = await _context.Enrollments.AnyAsync(x =>
            x.TrainingBatchId == batchId &&
            x.ParticipantProfile.UserId == userId);

        if (!isTrainer && !isAdmin && !isParticipant)
            throw new UnauthorizedAccessException(
                "You are not authorized to view attendance for this training batch.");

        var cacheKey = $"{AttendanceCachePrefix}batch:{batchId}";

        if (_cache.TryGet<List<AttendanceRecordDto>>(
                cacheKey,
                out var cachedRecords) &&
            cachedRecords is not null)
        {
            return cachedRecords;
        }

        var records = await _context.AttendanceRecords
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
                x.Method ?? string.Empty))
            .ToListAsync();

        _cache.Set(cacheKey, records, CacheDuration);

        return records;
    }

    // =========================================================
    // GET OPEN SESSION ID
    // =========================================================

    public async Task<Guid?> GetOpenSessionIdAsync(
        Guid batchId,
        Guid trainingSessionId,
        Guid userId)
    {
        var batch = await _context.TrainingBatches
            .Include(x => x.TrainerAssignments)
                .ThenInclude(x => x.TrainerProfile)
            .FirstOrDefaultAsync(x => x.Id == batchId);

        if (batch is null)
            return null;

        var isTrainer = batch.TrainerAssignments.Any(x =>
            x.IsActive &&
            x.TrainerProfile.UserId == userId);

        var isAdmin = await _context.Users.AnyAsync(x =>
            x.Id == userId &&
            x.Role == UserRole.Admin);

        var isParticipant = await _context.Enrollments.AnyAsync(x =>
            x.TrainingBatchId == batchId &&
            x.ParticipantProfile.UserId == userId);

        if (!isTrainer && !isAdmin && !isParticipant)
            return null;

        var trainingSessionExists = await _context.TrainingSessions
            .AnyAsync(x =>
                x.Id == trainingSessionId &&
                x.TrainingBatchId == batchId);

        if (!trainingSessionExists)
            return null;

        var cacheKey =
            $"{AttendanceCachePrefix}open-id:{batchId}:{trainingSessionId}";

        if (_cache.TryGet<Guid?>(
                cacheKey,
                out var cachedSessionId))
        {
            return cachedSessionId;
        }

        var session = await _context.AttendanceSessions
            .Where(x =>
                x.TrainingBatchId == batchId &&
                x.TrainingSessionId == trainingSessionId &&
                x.Status == AttendanceSessionStatus.Open)
            .FirstOrDefaultAsync();

        Guid? sessionId = session?.Id;

        _cache.Set(cacheKey, sessionId, CacheDuration);

        return sessionId;
    }

    // =========================================================
    // GET OPEN SESSION
    // =========================================================

    public async Task<OpenAttendanceSessionDto> GetOpenSessionAsync(
        Guid batchId,
        Guid trainingSessionId,
        Guid userId)
    {
        var batch = await _context.TrainingBatches
            .Include(x => x.TrainerAssignments)
                .ThenInclude(x => x.TrainerProfile)
            .FirstOrDefaultAsync(x => x.Id == batchId);

        if (batch is null)
            throw new KeyNotFoundException(
                "Training batch not found.");

        var isTrainer = batch.TrainerAssignments.Any(x =>
            x.IsActive &&
            x.TrainerProfile.UserId == userId);

        var isAdmin = await _context.Users.AnyAsync(x =>
            x.Id == userId &&
            x.Role == UserRole.Admin);

        var isParticipant = await _context.Enrollments.AnyAsync(x =>
            x.TrainingBatchId == batchId &&
            x.ParticipantProfile.UserId == userId);

        if (!isTrainer && !isAdmin && !isParticipant)
            throw new UnauthorizedAccessException(
                "You are not authorized to view attendance for this training batch.");

        var trainingSessionExists = await _context.TrainingSessions
            .AnyAsync(x =>
                x.Id == trainingSessionId &&
                x.TrainingBatchId == batchId);

        if (!trainingSessionExists)
            throw new KeyNotFoundException(
                "Training session not found for this training batch.");

        var cacheKey =
            $"{AttendanceCachePrefix}open:{batchId}:{trainingSessionId}";

        if (_cache.TryGet<OpenAttendanceSessionDto>(
                cacheKey,
                out var cachedSession) &&
            cachedSession is not null)
        {
            return cachedSession;
        }

        var session = await _context.AttendanceSessions
            .Where(x =>
                x.TrainingBatchId == batchId &&
                x.TrainingSessionId == trainingSessionId &&
                x.Status == AttendanceSessionStatus.Open)
            .FirstOrDefaultAsync();

        var result = session is null
            ? new OpenAttendanceSessionDto(false, null, false)
            : new OpenAttendanceSessionDto(
                true,
                session.Id,
                session.ManualAttendanceStatus ==
                    ManualAttendanceStatus.Open);

        _cache.Set(cacheKey, result, CacheDuration);

        return result;
    }

    // =========================================================
    // PHILIPPINE TIME ZONE
    // =========================================================

    private static TimeZoneInfo GetPhilippineTimeZone()
    {
        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(
                "Asia/Manila");
        }
        catch (TimeZoneNotFoundException)
        {
            return TimeZoneInfo.FindSystemTimeZoneById(
                "Singapore Standard Time");
        }
    }

    private static DateTime ConvertUtcToPhilippineTime(
        DateTime utcTime)
    {
        var utc = DateTime.SpecifyKind(
            utcTime,
            DateTimeKind.Utc);

        return TimeZoneInfo.ConvertTimeFromUtc(
            utc,
            GetPhilippineTimeZone());
    }

    // =========================================================
    // CALCULATE ATTENDANCE STATUS
    // =========================================================

    private static AttendanceStatus CalculateAttendanceStatus(
        DateTime openedAt,
        DateTime timeInUtc)
    {
        var openedAtUtc = DateTime.SpecifyKind(
            openedAt,
            DateTimeKind.Utc);

        var timeIn = DateTime.SpecifyKind(
            timeInUtc,
            DateTimeKind.Utc);

        var elapsed = timeIn - openedAtUtc;

        Console.WriteLine(
            $"[Attendance] OpenedAt UTC: {openedAtUtc:O}");

        Console.WriteLine(
            $"[Attendance] TimeIn UTC: {timeIn:O}");

        Console.WriteLine(
            $"[Attendance] Elapsed: {elapsed}");

        return elapsed > TimeSpan.FromMinutes(15)
            ? AttendanceStatus.Late
            : AttendanceStatus.Present;
    }

    // =========================================================
    // GET SESSION FOR ASSIGNED TRAINER
    // =========================================================

    private async Task<AttendanceSession> GetSessionForTrainerAsync(
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

        return session;
    }

    // =========================================================
    // GET TRAINER ATTENDANCE PROGRESS
    // =========================================================

    public async Task<IEnumerable<AttendanceProgressDto>>
        GetTrainerAttendanceProgressAsync(Guid trainerUserId)
    {
        var cacheKey =
            $"{AttendanceCachePrefix}trainer-progress:{trainerUserId}";

        if (_cache.TryGet<List<AttendanceProgressDto>>(
                cacheKey,
                out var cachedProgress) &&
            cachedProgress is not null)
        {
            return cachedProgress;
        }

        var trainerBatchIds = await _context.TrainingBatches
            .AsNoTracking()
            .Where(batch => batch.TrainerAssignments.Any(assignment =>
                assignment.IsActive &&
                assignment.TrainerProfile.UserId == trainerUserId))
            .Select(batch => batch.Id)
            .ToListAsync();

        if (trainerBatchIds.Count == 0)
        {
            var emptyResult = new List<AttendanceProgressDto>();

            _cache.Set(cacheKey, emptyResult, CacheDuration);

            return emptyResult;
        }

        var enrollments = await _context.Enrollments
            .AsNoTracking()
            .Where(enrollment =>
                trainerBatchIds.Contains(enrollment.TrainingBatchId) &&
                enrollment.Status == EnrollmentStatus.Approved)
            .Include(enrollment => enrollment.ParticipantProfile)
                .ThenInclude(profile => profile.User)
            .ToListAsync();

        if (enrollments.Count == 0)
        {
            var emptyResult = new List<AttendanceProgressDto>();

            _cache.Set(cacheKey, emptyResult, CacheDuration);

            return emptyResult;
        }

        var sessionCounts = await _context.TrainingSessions
            .AsNoTracking()
            .Where(session =>
                trainerBatchIds.Contains(session.TrainingBatchId))
            .GroupBy(session => session.TrainingBatchId)
            .Select(group => new
            {
                TrainingBatchId = group.Key,
                TotalSessions = group.Count()
            })
            .ToDictionaryAsync(
                x => x.TrainingBatchId,
                x => x.TotalSessions);

        var enrollmentIds = enrollments
            .Select(x => x.Id)
            .ToList();

        var attendanceRecords = await _context.AttendanceRecords
            .AsNoTracking()
            .Where(record =>
                enrollmentIds.Contains(record.EnrollmentId))
            .Select(record => new
            {
                record.EnrollmentId,
                record.Status
            })
            .ToListAsync();

        var result = new List<AttendanceProgressDto>();

        foreach (var enrollment in enrollments)
        {
            var records = attendanceRecords
                .Where(record =>
                    record.EnrollmentId == enrollment.Id)
                .ToList();

            var totalSessions = sessionCounts.TryGetValue(
                enrollment.TrainingBatchId,
                out var count)
                ? count
                : 0;

            var attendedSessions = records.Count(record =>
                record.Status == AttendanceStatus.Present ||
                record.Status == AttendanceStatus.Late ||
                record.Status == AttendanceStatus.TimeInOnly ||
                record.Status == AttendanceStatus.TimeOutOnly);

            var lateSessions = records.Count(record =>
                record.Status == AttendanceStatus.Late);

            var absentSessions = records.Count(record =>
                record.Status == AttendanceStatus.Absent);

            var attendancePercentage = totalSessions > 0
                ? decimal.Round(
                    (decimal)attendedSessions / totalSessions * 100m,
                    2,
                    MidpointRounding.AwayFromZero)
                : 0m;

            result.Add(new AttendanceProgressDto(
                EnrollmentId: enrollment.Id,
                TrainingBatchId: enrollment.TrainingBatchId,
                ParticipantName:
                    enrollment.ParticipantProfile.User.FullName,
                TotalSessions: totalSessions,
                AttendedSessions: attendedSessions,
                LateSessions: lateSessions,
                AbsentSessions: absentSessions,
                AttendancePercentage: attendancePercentage
            ));
        }

        var orderedResult = result
            .OrderBy(x => x.ParticipantName)
            .ToList();

        _cache.Set(cacheKey, orderedResult, CacheDuration);

        return orderedResult;
    }
}
