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
        private readonly CloudinaryService _cloudinary;

        public TrainingProgramService(AppDbContext context,  CloudinaryService cloudinary)
        {
            _context = context;
            _cloudinary = cloudinary;
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
                    // TrainerName = tp.Trainer.FullName,
                    Thumbnail = tp.Thumbnail,
                    Status = tp.Status,
                    StartDate = tp.StartDate,
                    EndDate = tp.EndDate
                })
                .ToListAsync();
        }

        public async Task<TrainingProgramResponseDto?> GetByIdAsync(Guid id)
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
                    // TrainerName = tp.Trainer.FullName,
                    Thumbnail = tp.Thumbnail,
                    Status = tp.Status,
                    StartDate = tp.StartDate,
                    EndDate = tp.EndDate
                })
                .FirstOrDefaultAsync();
        }

     public async Task<TrainingProgramResponseDto> CreateAsync(CreateTrainingProgramDto dto)
{
    string? thumbnail = null;

    if (dto.Thumbnail != null)
    {
        thumbnail = await _cloudinary.UploadImageAsync(
            dto.Thumbnail);
    }

    var training = new TrainingProgramModel
    {
        ProgramCode = await GenerateProgramCode(),

        Title = dto.Title,
        Category = dto.Category,
        Description = dto.Description,
        Objectives = dto.Objectives,
        Venue = dto.Venue,
        MaxParticipants = dto.MaxParticipants,

        TrainerId = dto.TrainerId,   // pwede nang null

        Thumbnail = thumbnail,

        Status = dto.Status,

        StartDate = dto.StartDate,
        EndDate = dto.EndDate,

        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    _context.TrainingPrograms.Add(training);

    await _context.SaveChangesAsync();

    return await GetByIdAsync(training.Id)
        ?? throw new Exception("Training not found.");
}
       public async Task<TrainingProgramResponseDto?> UpdateAsync(
    Guid id,
    UpdateTrainingProgramDto dto)
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

    if (dto.Thumbnail != null)
    {
        training.Thumbnail = await _cloudinary.UploadImageAsync(dto.Thumbnail);
    }

    training.Status = dto.Status;
    training.StartDate = dto.StartDate;
    training.EndDate = dto.EndDate;
    training.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    return await GetByIdAsync(id);
}
        public async Task<bool> DeleteAsync(Guid id)
        {
            var training = await _context.TrainingPrograms.FindAsync(id);

            if (training == null)
                return false;

            _context.TrainingPrograms.Remove(training);

            await _context.SaveChangesAsync();

            return true;
        }

        private async Task<string> GenerateProgramCode()
{
    var lastProgram = await _context.TrainingPrograms
        .OrderByDescending(x => x.Id)
        .FirstOrDefaultAsync();

    int nextNumber = 1;

    if (lastProgram != null)
    {
        var parts = lastProgram.ProgramCode.Split('-');

        if (parts.Length == 2 &&
            int.TryParse(parts[1], out int number))
        {
            nextNumber = number + 1;
        }
    }

    return $"TR-{nextNumber:D3}";
}
    }

    
}

