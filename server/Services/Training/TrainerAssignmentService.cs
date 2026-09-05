using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Training;
using server.Interfaces.Training;
using server.Models.Training;

namespace server.Services.Training;

public class TrainerAssignmentService
    : ITrainerAssignmentService
{
    private readonly ApplicationDbContext _context;

    public TrainerAssignmentService(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TrainerAssignmentDto> AssignAsync(
        Guid adminUserId,
        AssignTrainerRequest request)
    {
        var trainer = await _context.TrainerProfiles
            .Include(x => x.User)
            .FirstOrDefaultAsync(x =>
                x.Id == request.TrainerProfileId &&
                x.IsActive);

        if (trainer is null)
            throw new KeyNotFoundException(
                "Active trainer profile not found.");

        var batch = await _context.TrainingBatches
            .FirstOrDefaultAsync(x =>
                x.Id == request.TrainingBatchId);

        if (batch is null)
            throw new KeyNotFoundException(
                "Training batch not found.");

        var existingAssignment =
            await _context.TrainerAssignments
                .AnyAsync(x =>
                    x.TrainerProfileId ==
                        request.TrainerProfileId &&
                    x.TrainingBatchId ==
                        request.TrainingBatchId &&
                    x.IsActive);

        if (existingAssignment)
            throw new InvalidOperationException(
                "This trainer is already assigned to this training batch.");

        var assignment = new TrainerAssignment
        {
            Id = Guid.NewGuid(),
            TrainerProfileId = request.TrainerProfileId,
            TrainingBatchId = request.TrainingBatchId,
            AssignedByUserId = adminUserId,
            AssignedAt = DateTime.UtcNow,
            IsActive = true
        };

        _context.TrainerAssignments.Add(assignment);

        await _context.SaveChangesAsync();

        return new TrainerAssignmentDto(
            assignment.Id,
            assignment.TrainerProfileId,
            assignment.TrainingBatchId,
            trainer.User.FullName,
            batch.BatchCode,
            assignment.AssignedAt,
            assignment.IsActive
        );
    }

   public async Task<IEnumerable<TrainerAssignmentDto>> GetAllAsync()
{
    var assignments = await _context.TrainerAssignments
        .AsNoTracking()
        .Include(x => x.TrainerProfile)
            .ThenInclude(x => x.User)
        .Include(x => x.TrainingBatch)
        .OrderByDescending(x => x.AssignedAt)
        .ToListAsync();

    return assignments.Select(x => new TrainerAssignmentDto(
        x.Id,
        x.TrainerProfileId,
        x.TrainingBatchId,
        x.TrainerProfile.User.FullName,
        x.TrainingBatch.BatchCode,
        x.AssignedAt,
        x.IsActive
    ));
}

public async Task<IEnumerable<TrainerAssignmentDto>> GetMyAssignmentsAsync(
    Guid trainerUserId)
{
    var assignments = await _context.TrainerAssignments
        .AsNoTracking()
        .Include(x => x.TrainerProfile)
            .ThenInclude(x => x.User)
        .Include(x => x.TrainingBatch)
        .Where(x =>
            x.TrainerProfile.UserId == trainerUserId &&
            x.IsActive)
        .OrderByDescending(x => x.AssignedAt)
        .ToListAsync();

    return assignments.Select(x => new TrainerAssignmentDto(
        x.Id,
        x.TrainerProfileId,
        x.TrainingBatchId,
        x.TrainerProfile.User.FullName,
        x.TrainingBatch.BatchCode,
        x.AssignedAt,
        x.IsActive
    ));
}



   public async Task DeleteAsync(Guid id)
{
    var assignment = await _context.TrainerAssignments
        .FirstOrDefaultAsync(x => x.Id == id);

    if (assignment is null)
        throw new KeyNotFoundException(
            "Trainer assignment not found."
        );

    _context.TrainerAssignments.Remove(assignment);

    await _context.SaveChangesAsync();
}
}