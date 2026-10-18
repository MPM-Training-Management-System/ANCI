
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Training;
using server.Interfaces;
using server.Interfaces.Training;
using server.Models.Training;
using server.Enums;

namespace server.Services.Training;

public class TrainingBatchService : ITrainingBatchService
{
    private readonly ApplicationDbContext _context;
    private readonly ICacheService _cacheService;

    private static readonly TimeSpan CacheDuration =
        TimeSpan.FromMinutes(5);

    private const string CachePrefix = "training:batches:";
    private const string AllBatchesCacheKey =
        "training:batches:all";

    public TrainingBatchService(
        ApplicationDbContext context,
        ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    // =========================================================
    // CACHE HELPERS
    // =========================================================

    private static string GetAssignedCacheKey(Guid trainerUserId)
        => $"{CachePrefix}assigned:{trainerUserId}";

    private static string GetBatchCacheKey(Guid id)
        => $"{CachePrefix}id:{id}";

    private static string GetRequirementsCacheKey(Guid id)
        => $"{CachePrefix}requirements:{id}";

    private void InvalidateBatchCaches()
    {
        // Clears only TrainingBatch-related cache entries.
        _cacheService.Remove(CachePrefix);
    }

    // =========================================================
    // GET ALL BATCHES
    // =========================================================

    public async Task<IEnumerable<TrainingBatchDto>> GetAllAsync()
    {
        if (_cacheService.TryGet<IEnumerable<TrainingBatchDto>>(
                AllBatchesCacheKey,
                out var cached) &&
            cached is not null)
        {
            return cached;
        }

        var batches = await _context.TrainingBatches
            .AsNoTracking()
            .Include(x => x.TrainingProgram)
            .Include(x => x.TrainerAssignments)
                .ThenInclude(x => x.TrainerProfile)
                    .ThenInclude(x => x.User)
            .OrderByDescending(x => x.StartDate)
            .ToListAsync();

        var batchIds = batches
            .Select(x => x.Id)
            .ToList();

        var enrollmentCounts = await _context.Enrollments
            .Where(x =>
                batchIds.Contains(x.TrainingBatchId) &&
                x.Status != EnrollmentStatus.Rejected &&
                x.Status != EnrollmentStatus.Cancelled)
            .GroupBy(x => x.TrainingBatchId)
            .Select(g => new
            {
                TrainingBatchId = g.Key,
                Count = g.Count()
            })
            .ToDictionaryAsync(
                x => x.TrainingBatchId,
                x => x.Count);

        var result = batches.Select(x =>
        {
            var assignment = x.TrainerAssignments
                .FirstOrDefault();

            TrainingBatchTrainerDto? trainer = null;

            if (assignment?.TrainerProfile?.User is not null)
            {
                trainer = new TrainingBatchTrainerDto(
                    assignment.TrainerProfile.Id,
                    assignment.TrainerProfile.UserId,
                    assignment.TrainerProfile.User.FullName,
                    assignment.TrainerProfile.User.UserCode,
                    assignment.TrainerProfile.User.Email,
                    assignment.TrainerProfile.ProfileImageUrl);
            }

            enrollmentCounts.TryGetValue(
                x.Id,
                out var enrolledCount);

            return new TrainingBatchDto(
                x.Id,
                x.TrainingProgram.Name,
                x.BatchCode,
                x.Location,
                x.StartDate,
                x.EndDate,
                x.Capacity,
                enrolledCount,
                x.Status.ToString(),
                trainer);
        }).ToList();

        _cacheService.Set<IEnumerable<TrainingBatchDto>>(
            AllBatchesCacheKey,
            result,
            CacheDuration);

        return result;
    }

    // =========================================================
    // GET BATCHES ASSIGNED TO TRAINER
    // =========================================================

    public async Task<IEnumerable<TrainingBatchDto>> GetAssignedAsync(
        Guid trainerUserId)
    {
        var cacheKey = GetAssignedCacheKey(trainerUserId);

        if (_cacheService.TryGet<IEnumerable<TrainingBatchDto>>(
                cacheKey,
                out var cached) &&
            cached is not null)
        {
            return cached;
        }

        var batches = await _context.TrainingBatches
            .AsNoTracking()
            .Include(x => x.TrainingProgram)
            .Include(x => x.TrainerAssignments)
                .ThenInclude(x => x.TrainerProfile)
                    .ThenInclude(x => x.User)
            .Where(x =>
                x.TrainerAssignments.Any(assignment =>
                    assignment.IsActive &&
                    assignment.TrainerProfile.UserId == trainerUserId))
            .OrderByDescending(x => x.StartDate)
            .ToListAsync();

        var batchIds = batches
            .Select(x => x.Id)
            .ToList();

        var enrollmentCounts = await _context.Enrollments
            .Where(x =>
                batchIds.Contains(x.TrainingBatchId) &&
                x.Status != EnrollmentStatus.Rejected &&
                x.Status != EnrollmentStatus.Cancelled)
            .GroupBy(x => x.TrainingBatchId)
            .Select(g => new
            {
                TrainingBatchId = g.Key,
                Count = g.Count()
            })
            .ToDictionaryAsync(
                x => x.TrainingBatchId,
                x => x.Count);

        var result = batches.Select(x =>
        {
            var assignment = x.TrainerAssignments
                .FirstOrDefault(a =>
                    a.IsActive &&
                    a.TrainerProfile.UserId == trainerUserId);

            TrainingBatchTrainerDto? trainer = null;

            if (assignment?.TrainerProfile?.User is not null)
            {
                trainer = new TrainingBatchTrainerDto(
                    assignment.TrainerProfile.Id,
                    assignment.TrainerProfile.UserId,
                    assignment.TrainerProfile.User.FullName,
                    assignment.TrainerProfile.User.UserCode,
                    assignment.TrainerProfile.User.Email,
                    assignment.TrainerProfile.ProfileImageUrl);
            }

            enrollmentCounts.TryGetValue(
                x.Id,
                out var enrolledCount);

            return new TrainingBatchDto(
                x.Id,
                x.TrainingProgram.Name,
                x.BatchCode,
                x.Location,
                x.StartDate,
                x.EndDate,
                x.Capacity,
                enrolledCount,
                x.Status.ToString(),
                trainer);
        }).ToList();

        _cacheService.Set<IEnumerable<TrainingBatchDto>>(
            cacheKey,
            result,
            CacheDuration);

        return result;
    }

    // =========================================================
    // GET BATCH BY ID
    // =========================================================

    public async Task<TrainingBatchDto?> GetByIdAsync(Guid id)
    {
        var cacheKey = GetBatchCacheKey(id);

        if (_cacheService.TryGet<TrainingBatchDto>(
                cacheKey,
                out var cached) &&
            cached is not null)
        {
            return cached;
        }

        var result = await _context.TrainingBatches
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new TrainingBatchDto(
                x.Id,
                x.TrainingProgram.Name,
                x.BatchCode,
                x.Location,
                x.StartDate,
                x.EndDate,
                x.Capacity,
                x.Enrollments.Count,
                x.Status.ToString(),
                null))
            .FirstOrDefaultAsync();

        if (result is not null)
        {
            _cacheService.Set(
                cacheKey,
                result,
                CacheDuration);
        }

        return result;
    }

    // =========================================================
    // CREATE BATCH
    // =========================================================

    public async Task<TrainingBatchDto> CreateAsync(
        CreateTrainingBatchRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.BatchCode))
        {
            throw new ArgumentException(
                "Batch code is required.");
        }

        if (request.StartDate > request.EndDate)
        {
            throw new ArgumentException(
                "Start date cannot be later than end date.");
        }

        if (request.Capacity <= 0)
        {
            throw new ArgumentException(
                "Capacity must be greater than zero.");
        }

        var program = await _context.TrainingPrograms
            .FirstOrDefaultAsync(x =>
                x.Id == request.TrainingProgramId &&
                x.IsActive);

        if (program is null)
        {
            throw new KeyNotFoundException(
                "Active training program not found.");
        }

        var batchCode = request.BatchCode.Trim();

        var exists = await _context.TrainingBatches
            .AnyAsync(x => x.BatchCode == batchCode);

        if (exists)
        {
            throw new InvalidOperationException(
                "A training batch with this batch code already exists.");
        }

        var batch = new TrainingBatch
        {
            Id = Guid.NewGuid(),
            TrainingProgramId = request.TrainingProgramId,
            BatchCode = batchCode,
            Location = request.Location?.Trim(),
            StartDate = DateTime.SpecifyKind(
                request.StartDate,
                DateTimeKind.Utc),
            EndDate = DateTime.SpecifyKind(
                request.EndDate,
                DateTimeKind.Utc),
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Capacity = request.Capacity,
            Status = TrainingStatus.Draft
        };

        _context.TrainingBatches.Add(batch);

        await _context.SaveChangesAsync();

        InvalidateBatchCaches();

        return new TrainingBatchDto(
            batch.Id,
            program.Name,
            batch.BatchCode,
            batch.Location,
            batch.StartDate,
            batch.EndDate,
            batch.Capacity,
            0,
            batch.Status.ToString(),
            null);
    }

    // =========================================================
    // UPDATE BATCH
    // =========================================================

    public async Task UpdateAsync(
        Guid id,
        CreateTrainingBatchRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.BatchCode))
        {
            throw new ArgumentException(
                "Batch code is required.");
        }

        if (request.StartDate > request.EndDate)
        {
            throw new ArgumentException(
                "Start date cannot be later than end date.");
        }

        if (request.Capacity <= 0)
        {
            throw new ArgumentException(
                "Capacity must be greater than zero.");
        }

        var batch = await _context.TrainingBatches
            .FirstOrDefaultAsync(x => x.Id == id);

        if (batch is null)
        {
            throw new KeyNotFoundException(
                "Training batch not found.");
        }

        var programExists = await _context.TrainingPrograms
            .AnyAsync(x =>
                x.Id == request.TrainingProgramId &&
                x.IsActive);

        if (!programExists)
        {
            throw new KeyNotFoundException(
                "Active training program not found.");
        }

        var batchCode = request.BatchCode.Trim();

        var duplicate = await _context.TrainingBatches
            .AnyAsync(x =>
                x.Id != id &&
                x.BatchCode == batchCode);

        if (duplicate)
        {
            throw new InvalidOperationException(
                "A training batch with this batch code already exists.");
        }

        var enrolledCount = await _context.Enrollments
            .CountAsync(x => x.TrainingBatchId == id);

        if (request.Capacity < enrolledCount)
        {
            throw new InvalidOperationException(
                "Capacity cannot be lower than the current enrolled count.");
        }

        batch.TrainingProgramId = request.TrainingProgramId;
        batch.BatchCode = batchCode;
        batch.Location = request.Location?.Trim();

        batch.StartDate = DateTime.SpecifyKind(
            request.StartDate,
            DateTimeKind.Utc);

        batch.EndDate = DateTime.SpecifyKind(
            request.EndDate,
            DateTimeKind.Utc);

        batch.StartTime = request.StartTime;
        batch.EndTime = request.EndTime;
        batch.Capacity = request.Capacity;

        await _context.SaveChangesAsync();

        InvalidateBatchCaches();
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    public async Task UpdateStatusAsync(
        Guid id,
        string status)
    {
        var batch = await _context.TrainingBatches
            .FirstOrDefaultAsync(x => x.Id == id);

        if (batch is null)
        {
            throw new KeyNotFoundException(
                "Training batch not found.");
        }

        if (!Enum.TryParse<TrainingStatus>(
                status,
                true,
                out var newStatus))
        {
            throw new ArgumentException(
                "Invalid training status.");
        }

        batch.Status = newStatus;

        await _context.SaveChangesAsync();

        InvalidateBatchCaches();
    }

    // =========================================================
    // DELETE BATCH
    // =========================================================

    public async Task DeleteAsync(Guid id)
    {
        var batch = await _context.TrainingBatches
            .FirstOrDefaultAsync(x => x.Id == id);

        if (batch is null)
        {
            throw new KeyNotFoundException(
                "Training batch not found.");
        }

        var hasEnrollments = await _context.Enrollments
            .AnyAsync(x => x.TrainingBatchId == id);

        if (hasEnrollments)
        {
            throw new InvalidOperationException(
                "Cannot delete this training batch because it already has enrolled participants.");
        }

        var hasTrainerAssignments =
            await _context.TrainerAssignments
                .AnyAsync(x => x.TrainingBatchId == id);

        if (hasTrainerAssignments)
        {
            throw new InvalidOperationException(
                "Cannot delete this training batch because a trainer is assigned to it.");
        }

        _context.TrainingBatches.Remove(batch);

        await _context.SaveChangesAsync();

        InvalidateBatchCaches();
    }

    // =========================================================
    // GET TRAINING PROGRAM REQUIREMENTS FOR A BATCH
    // =========================================================

    public async Task<IEnumerable<TrainingProgramRequirementDto>>
        GetRequirementsAsync(Guid trainingBatchId)
    {
        var cacheKey =
            GetRequirementsCacheKey(trainingBatchId);

        if (_cacheService.TryGet<
                IEnumerable<TrainingProgramRequirementDto>>(
                cacheKey,
                out var cached) &&
            cached is not null)
        {
            return cached;
        }

        var batch = await _context.TrainingBatches
            .AsNoTracking()
            .Where(x => x.Id == trainingBatchId)
            .Select(x => new
            {
                x.Id,
                x.TrainingProgramId
            })
            .FirstOrDefaultAsync();

        if (batch is null)
        {
            throw new KeyNotFoundException(
                "Training batch not found.");
        }

        var requirements =
            await _context.TrainingProgramRequirements
                .AsNoTracking()
                .Where(x =>
                    x.TrainingProgramId ==
                    batch.TrainingProgramId)
                .OrderBy(x => x.DisplayOrder)
                .Select(x =>
                    new TrainingProgramRequirementDto(
                        x.Id,
                        x.Name,
                        x.Description,
                        x.IsRequired,
                        x.DisplayOrder))
                .ToListAsync();

        _cacheService.Set<
            IEnumerable<TrainingProgramRequirementDto>>(
            cacheKey,
            requirements,
            CacheDuration);

        return requirements;
    }
}
