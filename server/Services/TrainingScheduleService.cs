using Microsoft.EntityFrameworkCore;
using server.Algorithms;
using server.Data;
using server.DTOs.TrainingSchedule;
using server.Models;
using server.Services.Interfaces;

namespace server.Services
{
    public class TrainingScheduleService : ITrainingScheduleService
    {
        private readonly AppDbContext _context;
        private readonly ScheduleConflictChecker _conflictChecker;

        public TrainingScheduleService(
            AppDbContext context,
            ScheduleConflictChecker conflictChecker)
        {
            _context = context;
            _conflictChecker = conflictChecker;
        }

        public async Task<IEnumerable<TrainingScheduleResponseDto>> GetAllAsync()
        {
            return await _context.TrainingSchedules
                .Include(x => x.TrainingProgram)
                .Include(x => x.Trainer)
                .Select(x => new TrainingScheduleResponseDto
                {
                    Id = x.Id,
                    TrainingProgramId = x.TrainingProgramId,
                    TrainingTitle = x.TrainingProgram.Title,
                    TrainerId = x.TrainerId,
                    TrainerName = x.Trainer.FullName,
                    StartDate = x.StartDate,
                    EndDate = x.EndDate,
                    Venue = x.Venue,
                    MaximumParticipants = x.MaximumParticipants,
                    CurrentParticipants = x.CurrentParticipants,
                    Status = x.Status
                })
                .ToListAsync();
        }

        public async Task<TrainingScheduleResponseDto?> GetByIdAsync(int id)
        {
            return await _context.TrainingSchedules
                .Include(x => x.TrainingProgram)
                .Include(x => x.Trainer)
                .Where(x => x.Id == id)
                .Select(x => new TrainingScheduleResponseDto
                {
                    Id = x.Id,
                    TrainingProgramId = x.TrainingProgramId,
                    TrainingTitle = x.TrainingProgram.Title,
                    TrainerId = x.TrainerId,
                    TrainerName = x.Trainer.FullName,
                    StartDate = x.StartDate,
                    EndDate = x.EndDate,
                    Venue = x.Venue,
                    MaximumParticipants = x.MaximumParticipants,
                    CurrentParticipants = x.CurrentParticipants,
                    Status = x.Status
                })
                .FirstOrDefaultAsync();
        }

        public async Task<TrainingScheduleResponseDto> CreateAsync(CreateTrainingScheduleDto dto)
        {
            bool conflict = await _conflictChecker.HasConflictAsync(
                dto.TrainerId,
                dto.Venue,
                dto.StartDate,
                dto.EndDate);

            if (conflict)
                throw new Exception("Schedule conflict detected.");

            var schedule = new TrainingScheduleModel
            {
                TrainingProgramId = dto.TrainingProgramId,
                TrainerId = dto.TrainerId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Venue = dto.Venue,
                MaximumParticipants = dto.MaximumParticipants,
                CurrentParticipants = 0,
                Status = "Scheduled",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.TrainingSchedules.Add(schedule);

            await _context.SaveChangesAsync();

            return await GetByIdAsync(schedule.Id)
                ?? throw new Exception("Schedule not found.");
        }

        public async Task<TrainingScheduleResponseDto?> UpdateAsync(
            int id,
            UpdateTrainingScheduleDto dto)
        {
            var schedule = await _context.TrainingSchedules.FindAsync(id);

            if (schedule == null)
                return null;

            bool conflict = await _conflictChecker.HasConflictAsync(
                dto.TrainerId,
                dto.Venue,
                dto.StartDate,
                dto.EndDate,
                id);

            if (conflict)
                throw new Exception("Schedule conflict detected.");

            schedule.TrainingProgramId = dto.TrainingProgramId;
            schedule.TrainerId = dto.TrainerId;
            schedule.StartDate = dto.StartDate;
            schedule.EndDate = dto.EndDate;
            schedule.Venue = dto.Venue;
            schedule.MaximumParticipants = dto.MaximumParticipants;
            schedule.Status = dto.Status;
            schedule.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var schedule = await _context.TrainingSchedules.FindAsync(id);

            if (schedule == null)
                return false;

            _context.TrainingSchedules.Remove(schedule);

            await _context.SaveChangesAsync();

            return true;
        }
        public async Task<bool> HasConflictAsync(
    int trainerId,
    string venue,
    DateTime startDate,
    DateTime endDate,
    int? excludeScheduleId = null)
{
    Console.WriteLine("========== NEW SCHEDULE ==========");
    Console.WriteLine($"Trainer : {trainerId}");
    Console.WriteLine($"Venue   : {venue}");
    Console.WriteLine($"Start   : {startDate}");
    Console.WriteLine($"End     : {endDate}");

    var schedules = await _context.TrainingSchedules.ToListAsync();

    foreach (var s in schedules)
    {
        Console.WriteLine("--------------------------------");
        Console.WriteLine($"ID      : {s.Id}");
        Console.WriteLine($"Trainer : {s.TrainerId}");
        Console.WriteLine($"Venue   : {s.Venue}");
        Console.WriteLine($"Start   : {s.StartDate}");
        Console.WriteLine($"End     : {s.EndDate}");
    }

    bool trainerConflict = await _context.TrainingSchedules.AnyAsync(x =>
        x.TrainerId == trainerId &&
        (excludeScheduleId == null || x.Id != excludeScheduleId) &&
        startDate < x.EndDate &&
        endDate > x.StartDate);

    Console.WriteLine($"Trainer Conflict: {trainerConflict}");

    bool venueConflict = await _context.TrainingSchedules.AnyAsync(x =>
        x.Venue == venue &&
        (excludeScheduleId == null || x.Id != excludeScheduleId) &&
        startDate < x.EndDate &&
        endDate > x.StartDate);

    Console.WriteLine($"Venue Conflict: {venueConflict}");

    return trainerConflict || venueConflict;
}
    }
    
}