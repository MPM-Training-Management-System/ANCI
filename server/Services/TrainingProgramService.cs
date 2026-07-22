using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.TrainingProgram;
using server.Models;
using server.Services.Interfaces;

namespace server.Services
{
    public class TrainingProgramService : ITrainingProgramService
    {
        private readonly AppDbContext _context;

        public TrainingProgramService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TrainingProgramResponseDto>> GetAllAsync()
        {
            return await _context.TrainingPrograms
                .Include(tp => tp.Trainer)
                .Select(tp => new TrainingProgramResponseDto
                {
                    Id = tp.Id,
                    ProgramCode = tp.ProgramCode,
                    Title = tp.Title,
                    Category = tp.Category,
                    Description = tp.Description,
                    Objectives = tp.Objectives,
                    Venue = tp.Venue,
                    MaxParticipants = tp.MaxParticipants,
                    TrainerId = tp.TrainerId,
                    TrainerName = tp.Trainer.FullName,
                    Thumbnail = tp.Thumbnail,
                    Status = tp.Status,
                    StartDate = tp.StartDate,
                    EndDate = tp.EndDate
                })
                .ToListAsync();
        }

        public async Task<TrainingProgramResponseDto?> GetByIdAsync(int id)
        {
            return await _context.TrainingPrograms
                .Include(tp => tp.Trainer)
                .Where(tp => tp.Id == id)
                .Select(tp => new TrainingProgramResponseDto
                {
                    Id = tp.Id,
                    ProgramCode = tp.ProgramCode,
                    Title = tp.Title,
                    Category = tp.Category,
                    Description = tp.Description,
                    Objectives = tp.Objectives,
                    Venue = tp.Venue,
                    MaxParticipants = tp.MaxParticipants,
                    TrainerId = tp.TrainerId,
                    TrainerName = tp.Trainer.FullName,
                    Thumbnail = tp.Thumbnail,
                    Status = tp.Status,
                    StartDate = tp.StartDate,
                    EndDate = tp.EndDate
                })
                .FirstOrDefaultAsync();
        }

        public async Task<TrainingProgramResponseDto> CreateAsync(CreateTrainingProgramDto dto)
        {
            int count = await _context.TrainingPrograms.CountAsync();

            var training = new TrainingProgramModel
            {
                ProgramCode = $"TRN-{(count + 1):D4}",
                Title = dto.Title,
                Category = dto.Category,
                Description = dto.Description,
                Objectives = dto.Objectives,
                Venue = dto.Venue,
                MaxParticipants = dto.MaxParticipants,
                TrainerId = dto.TrainerId,
                Thumbnail = dto.Thumbnail,
                Status = dto.Status,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.TrainingPrograms.Add(training);

            await _context.SaveChangesAsync();

            return await GetByIdAsync(training.Id)
                   ?? throw new Exception("Training Program not found.");
        }

        public async Task<TrainingProgramResponseDto?> UpdateAsync(int id, UpdateTrainingProgramDto dto)
        {
            var training = await _context.TrainingPrograms.FindAsync(id);

            if (training == null)
                return null;

            training.Title = dto.Title;
            training.Category = dto.Category;
            training.Description = dto.Description;
            training.Objectives = dto.Objectives;
            training.Venue = dto.Venue;
            training.MaxParticipants = dto.MaxParticipants;
            training.TrainerId = dto.TrainerId;
            training.Thumbnail = dto.Thumbnail;
            training.Status = dto.Status;
            training.StartDate = dto.StartDate;
            training.EndDate = dto.EndDate;
            training.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var training = await _context.TrainingPrograms.FindAsync(id);

            if (training == null)
                return false;

            _context.TrainingPrograms.Remove(training);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}