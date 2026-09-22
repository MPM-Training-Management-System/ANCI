using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Training;
using server.Models.Training;

namespace server.Services.Training;

public class ParticipationService : IParticipationService
{
    private readonly ApplicationDbContext _db;

    public ParticipationService(ApplicationDbContext db)
    {
        _db = db;
    }

    // ==========================================================
    // GET PARTICIPATION SETTING
    // ==========================================================

    public async Task<ParticipationSettingDto> GetSettingAsync(
        Guid trainingBatchId)
    {
        var setting =
            await _db.ParticipationSettings
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.TrainingBatchId == trainingBatchId);

        if (setting == null)
        {
            // Return default setting if none exists yet
            return new ParticipationSettingDto
            {
                Id = Guid.Empty,
                TrainingBatchId = trainingBatchId,
                RequiredRecitations = 5
            };
        }

        return MapSetting(setting);
    }


    // ==========================================================
    // SAVE PARTICIPATION SETTING
    // ==========================================================

    public async Task<ParticipationSettingDto> SaveSettingAsync(
        Guid trainingBatchId,
        int requiredRecitations)
    {
        if (requiredRecitations < 1)
        {
            throw new ArgumentException(
                "Required recitations must be at least 1.");
        }

        var batchExists =
            await _db.TrainingBatches
                .AnyAsync(x => x.Id == trainingBatchId);

        if (!batchExists)
        {
            throw new KeyNotFoundException(
                "Training batch not found.");
        }

        var setting =
            await _db.ParticipationSettings
                .FirstOrDefaultAsync(
                    x => x.TrainingBatchId == trainingBatchId);

        if (setting == null)
        {
            setting = new ParticipationSetting
            {
                Id = Guid.NewGuid(),
                TrainingBatchId = trainingBatchId,
                RequiredRecitations = requiredRecitations,
                CreatedAt = DateTime.UtcNow
            };

            _db.ParticipationSettings.Add(setting);
        }
        else
        {
            setting.RequiredRecitations = requiredRecitations;
            setting.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        return MapSetting(setting);
    }


    // ==========================================================
    // RECORD RECITATION
    // ==========================================================

    public async Task<ParticipationRecordDto> RecordRecitationAsync(
        Guid enrollmentId,
        Guid trainingSessionId,
        Guid recordedByUserId,
        string? remarks = null)
    {
        var enrollment =
            await _db.Enrollments
                .FirstOrDefaultAsync(x => x.Id == enrollmentId);

        if (enrollment == null)
        {
            throw new KeyNotFoundException(
                "Enrollment not found.");
        }

        var session =
            await _db.TrainingSessions
                .FirstOrDefaultAsync(x => x.Id == trainingSessionId);

        if (session == null)
        {
            throw new KeyNotFoundException(
                "Training session not found.");
        }

        // Make sure participant and session belong
        // to the same training batch.
        if (enrollment.TrainingBatchId != session.TrainingBatchId)
        {
            throw new InvalidOperationException(
                "The enrollment and training session belong to different training batches.");
        }

        // Only approved participants can participate.
       if (enrollment.Status != EnrollmentStatus.Approved)
{
    throw new InvalidOperationException(
        "Only approved participants can receive a recitation record.");
}

        // Prevent duplicate recitation in the same session.
        var existing =
            await _db.ParticipationRecords
                .FirstOrDefaultAsync(x =>
                    x.EnrollmentId == enrollmentId &&
                    x.TrainingSessionId == trainingSessionId);

        if (existing != null)
        {
            throw new InvalidOperationException(
                "This participant has already been recorded for this session.");
        }

        var record = new ParticipationRecord
        {
            Id = Guid.NewGuid(),
            EnrollmentId = enrollmentId,
            TrainingSessionId = trainingSessionId,
            RecordedByUserId = recordedByUserId,
            RecordedAt = DateTime.UtcNow,
            Remarks = remarks
        };

        _db.ParticipationRecords.Add(record);

        await _db.SaveChangesAsync();

        return MapRecord(record);
    }


    // ==========================================================
    // REMOVE RECITATION
    // ==========================================================

    public async Task RemoveRecitationAsync(Guid id)
    {
        var record =
            await _db.ParticipationRecords
                .FirstOrDefaultAsync(x => x.Id == id);

        if (record == null)
        {
            throw new KeyNotFoundException(
                "Participation record not found.");
        }

        _db.ParticipationRecords.Remove(record);

        await _db.SaveChangesAsync();
    }


    // ==========================================================
    // GET PARTICIPANTS FOR SESSION
    // ==========================================================

    public async Task<List<ParticipationParticipantDto>>
        GetSessionParticipantsAsync(Guid trainingSessionId)
    {
        var session =
            await _db.TrainingSessions
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == trainingSessionId);

        if (session == null)
        {
            throw new KeyNotFoundException(
                "Training session not found.");
        }

        var setting =
            await _db.ParticipationSettings
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.TrainingBatchId == session.TrainingBatchId);

        var requiredRecitations =
            setting?.RequiredRecitations ?? 5;

        var enrollments =
            await _db.Enrollments
                .AsNoTracking()
                .Where(x =>
    x.TrainingBatchId == session.TrainingBatchId &&
    x.Status == EnrollmentStatus.Approved)
                .Include(x => x.ParticipantProfile)
                .ToListAsync();

        var enrollmentIds =
            enrollments
                .Select(x => x.Id)
                .ToList();

        var records =
            await _db.ParticipationRecords
                .AsNoTracking()
                .Where(x =>
                    x.TrainingSessionId == trainingSessionId &&
                    enrollmentIds.Contains(x.EnrollmentId))
                .ToListAsync();

        var allRecords =
            await _db.ParticipationRecords
                .AsNoTracking()
                .Where(x =>
                    enrollmentIds.Contains(x.EnrollmentId))
                .ToListAsync();

        return enrollments
            .Select(enrollment =>
            {
                var sessionRecord =
                    records.FirstOrDefault(
                        x => x.EnrollmentId == enrollment.Id);

                var actualRecitations =
                    allRecords.Count(
                        x => x.EnrollmentId == enrollment.Id);

                var percentage =
                    CalculatePercentage(
                        actualRecitations,
                        requiredRecitations);

                return new ParticipationParticipantDto
                {
                    EnrollmentId = enrollment.Id,

                    ParticipantProfileId =
                        enrollment.ParticipantProfileId,

                    ParticipantName =
                        GetParticipantName(
                            enrollment.ParticipantProfile),

                    HasRecited =
                        sessionRecord != null,

                    ActualRecitations =
                        actualRecitations,

                    RequiredRecitations =
                        requiredRecitations,

                    ParticipationPercentage =
                        percentage,

                    ParticipationRecordId =
                        sessionRecord?.Id
                };
            })
            .ToList();
    }


    // ==========================================================
    // GET PARTICIPANT PROGRESS
    // ==========================================================

    public async Task<ParticipationProgressDto>
        GetParticipantProgressAsync(Guid enrollmentId)
    {
        var enrollment =
            await _db.Enrollments
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.Id == enrollmentId);

        if (enrollment == null)
        {
            throw new KeyNotFoundException(
                "Enrollment not found.");
        }

        var setting =
            await _db.ParticipationSettings
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.TrainingBatchId ==
                         enrollment.TrainingBatchId);

        var requiredRecitations =
            setting?.RequiredRecitations ?? 5;

        var actualRecitations =
            await _db.ParticipationRecords
                .CountAsync(
                    x => x.EnrollmentId == enrollmentId);

        return new ParticipationProgressDto
        {
            EnrollmentId = enrollmentId,

            ActualRecitations =
                actualRecitations,

            RequiredRecitations =
                requiredRecitations,

            ParticipationPercentage =
                CalculatePercentage(
                    actualRecitations,
                    requiredRecitations)
        };
    }


    // ==========================================================
    // CALCULATE PARTICIPATION %
    // ==========================================================

    private static decimal CalculatePercentage(
        int actualRecitations,
        int requiredRecitations)
    {
        if (requiredRecitations <= 0)
            return 0;

        var percentage =
            (decimal)actualRecitations /
            requiredRecitations *
            100m;

        return Math.Min(
            Math.Round(percentage, 2),
            100m);
    }


    // ==========================================================
    // MAPPERS
    // ==========================================================

    private static ParticipationSettingDto MapSetting(
        ParticipationSetting setting)
    {
        return new ParticipationSettingDto
        {
            Id = setting.Id,
            TrainingBatchId = setting.TrainingBatchId,
            RequiredRecitations = setting.RequiredRecitations,
            CreatedAt = setting.CreatedAt,
            UpdatedAt = setting.UpdatedAt
        };
    }


    private static ParticipationRecordDto MapRecord(
        ParticipationRecord record)
    {
        return new ParticipationRecordDto
        {
            Id = record.Id,
            EnrollmentId = record.EnrollmentId,
            TrainingSessionId = record.TrainingSessionId,
            RecordedByUserId = record.RecordedByUserId,
            RecordedAt = record.RecordedAt,
            Remarks = record.Remarks
        };
    }


    private static string GetParticipantName(
        object? profile)
    {
        if (profile == null)
            return "Unknown Participant";

        // Temporary generic mapping.
        // We will adjust this according to your
        // actual ParticipantProfile properties.
        var type = profile.GetType();

        var firstName =
            type.GetProperty("FirstName")
                ?.GetValue(profile)
                ?.ToString();

        var lastName =
            type.GetProperty("LastName")
                ?.GetValue(profile)
                ?.ToString();

        var fullName =
            type.GetProperty("FullName")
                ?.GetValue(profile)
                ?.ToString();

        if (!string.IsNullOrWhiteSpace(fullName))
            return fullName;

        return $"{firstName} {lastName}".Trim();
    }
}