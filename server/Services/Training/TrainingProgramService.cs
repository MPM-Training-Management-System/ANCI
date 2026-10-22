
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Training;
using server.Interfaces;
using server.Interfaces.Training;
using server.Models.Training;

namespace server.Services.Training;

public class TrainingProgramService : ITrainingProgramService
{
    private readonly ApplicationDbContext _context;
    private readonly ICacheService _cacheService;

    private static readonly TimeSpan CacheDuration =
        TimeSpan.FromMinutes(5);

    private const string AllProgramsCacheKey =
        "training:programs:all";

    public TrainingProgramService(
        ApplicationDbContext context,
        ICacheService cacheService)
    {
        _context = context;
        _cacheService = cacheService;
    }

    // =========================================================
    // GET ALL TRAINING PROGRAMS
    // =========================================================

    public async Task<IEnumerable<TrainingProgramDto>> GetAllAsync()
    {
        if (_cacheService.TryGet<IEnumerable<TrainingProgramDto>>(
                AllProgramsCacheKey,
                out var cached)
            && cached != null)
        {
            return cached;
        }

        var programs = await _context.TrainingPrograms
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new TrainingProgramDto(
                x.Id,
                x.ProgramCode,
                x.Name,
                x.Description,
                x.DurationHours,
                x.IsActive,
                x.CreatedAt,
                x.Requirements
                    .OrderBy(r => r.DisplayOrder)
                    .Select(r => new TrainingProgramRequirementDto(
                        r.Id,
                        r.Name,
                        r.Description,
                        r.IsRequired,
                        r.DisplayOrder
                    ))
                    .ToList()
            ))
            .ToListAsync();

        _cacheService.Set(
            AllProgramsCacheKey,
            programs,
            CacheDuration);

        return programs;
    }

    // =========================================================
    // GET TRAINING PROGRAM BY ID
    // =========================================================

    public async Task<TrainingProgramDto?> GetByIdAsync(Guid id)
    {
        var cacheKey = GetProgramCacheKey(id);

        if (_cacheService.TryGet<TrainingProgramDto>(
                cacheKey,
                out var cached)
            && cached != null)
        {
            return cached;
        }

        var program = await _context.TrainingPrograms
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new TrainingProgramDto(
                x.Id,
                x.ProgramCode,
                x.Name,
                x.Description,
                x.DurationHours,
                x.IsActive,
                x.CreatedAt,
                x.Requirements
                    .OrderBy(r => r.DisplayOrder)
                    .Select(r => new TrainingProgramRequirementDto(
                        r.Id,
                        r.Name,
                        r.Description,
                        r.IsRequired,
                        r.DisplayOrder
                    ))
                    .ToList()
            ))
            .FirstOrDefaultAsync();

        if (program != null)
        {
            _cacheService.Set(
                cacheKey,
                program,
                CacheDuration);
        }

        return program;
    }

    // =========================================================
    // CREATE TRAINING PROGRAM
    // =========================================================

    public async Task<TrainingProgramDto> CreateAsync(
        CreateTrainingProgramRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ProgramCode))
        {
            throw new ArgumentException(
                "Program code is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException(
                "Training program name is required.");
        }

        if (request.DurationHours <= 0)
        {
            throw new ArgumentException(
                "Duration hours must be greater than zero.");
        }

        var programCode = request.ProgramCode.Trim();

        var exists = await _context.TrainingPrograms
            .AnyAsync(x => x.ProgramCode == programCode);

        if (exists)
        {
            throw new InvalidOperationException(
                "A training program with this program code already exists.");
        }

        var requirements = request.Requirements
            ?? new List<CreateTrainingProgramRequirementRequest>();

        ValidateRequirements(requirements);

        var program = new TrainingProgram
        {
            Id = Guid.NewGuid(),
            ProgramCode = programCode,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            DurationHours = request.DurationHours,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        program.Requirements = requirements
            .OrderBy(x => x.DisplayOrder)
            .Select(requirement => new TrainingProgramRequirement
            {
                Id = Guid.NewGuid(),
                TrainingProgramId = program.Id,
                Name = requirement.Name.Trim(),
                Description = string.IsNullOrWhiteSpace(
                    requirement.Description)
                    ? null
                    : requirement.Description.Trim(),
                IsRequired = requirement.IsRequired,
                DisplayOrder = requirement.DisplayOrder
            })
            .ToList();

        _context.TrainingPrograms.Add(program);

        await _context.SaveChangesAsync();

        InvalidateProgramCaches(program.Id);

        return MapToDto(program);
    }

    // =========================================================
    // UPDATE TRAINING PROGRAM
    // =========================================================

    public async Task UpdateAsync(
        Guid id,
        UpdateTrainingProgramRequest request)
    {
        var program = await _context.TrainingPrograms
            .Include(x => x.Requirements)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (program is null)
        {
            throw new KeyNotFoundException(
                "Training program not found.");
        }

        if (string.IsNullOrWhiteSpace(request.ProgramCode))
        {
            throw new ArgumentException(
                "Program code is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException(
                "Training program name is required.");
        }

        if (request.DurationHours <= 0)
        {
            throw new ArgumentException(
                "Duration hours must be greater than zero.");
        }

        var programCode = request.ProgramCode.Trim();

        var duplicate = await _context.TrainingPrograms
            .AnyAsync(x =>
                x.Id != id &&
                x.ProgramCode == programCode);

        if (duplicate)
        {
            throw new InvalidOperationException(
                "A training program with this program code already exists.");
        }

        var requirements = request.Requirements
            ?? new List<CreateTrainingProgramRequirementRequest>();

        ValidateRequirements(requirements);

        program.ProgramCode = programCode;
        program.Name = request.Name.Trim();
        program.Description = string.IsNullOrWhiteSpace(
            request.Description)
            ? null
            : request.Description.Trim();
        program.DurationHours = request.DurationHours;

        // Replace old requirements.
        _context.TrainingProgramRequirements.RemoveRange(
            program.Requirements);

        program.Requirements = requirements
            .OrderBy(x => x.DisplayOrder)
            .Select(requirement => new TrainingProgramRequirement
            {
                Id = Guid.NewGuid(),
                TrainingProgramId = program.Id,
                Name = requirement.Name.Trim(),
                Description = string.IsNullOrWhiteSpace(
                    requirement.Description)
                    ? null
                    : requirement.Description.Trim(),
                IsRequired = requirement.IsRequired,
                DisplayOrder = requirement.DisplayOrder
            })
            .ToList();

        await _context.SaveChangesAsync();

        InvalidateProgramCaches(id);
    }

    // =========================================================
    // DELETE TRAINING PROGRAM
    // =========================================================

    public async Task DeleteAsync(Guid id)
    {
        var program = await _context.TrainingPrograms
            .Include(x => x.Batches)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (program is null)
        {
            throw new KeyNotFoundException(
                "Training program not found.");
        }

        if (program.Batches.Any())
        {
            throw new InvalidOperationException(
                "A training program with existing batches cannot be deleted.");
        }

        _context.TrainingPrograms.Remove(program);

        await _context.SaveChangesAsync();

        InvalidateProgramCaches(id);
    }

    // =========================================================
    // CACHE INVALIDATION
    // =========================================================

    private void InvalidateProgramCaches(Guid id)
    {
        _cacheService.Remove(AllProgramsCacheKey);
        _cacheService.Remove(GetProgramCacheKey(id));
    }

    private static string GetProgramCacheKey(Guid id)
    {
        return $"training:programs:id:{id}";
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    private static void ValidateRequirements(
        List<CreateTrainingProgramRequirementRequest> requirements)
    {
        var duplicateNames = requirements
            .Where(x => !string.IsNullOrWhiteSpace(x.Name))
            .GroupBy(
                x => x.Name.Trim(),
                StringComparer.OrdinalIgnoreCase)
            .Where(x => x.Count() > 1)
            .Select(x => x.Key)
            .ToList();

        if (duplicateNames.Any())
        {
            throw new InvalidOperationException(
                "Duplicate enrollment requirement names are not allowed.");
        }

        foreach (var requirement in requirements)
        {
            if (string.IsNullOrWhiteSpace(requirement.Name))
            {
                throw new ArgumentException(
                    "Enrollment requirement name is required.");
            }

            if (requirement.DisplayOrder < 0)
            {
                throw new ArgumentException(
                    "Enrollment requirement display order cannot be negative.");
            }
        }
    }

    // =========================================================
    // DTO MAPPING
    // =========================================================

    private static TrainingProgramDto MapToDto(
        TrainingProgram program)
    {
        return new TrainingProgramDto(
            program.Id,
            program.ProgramCode,
            program.Name,
            program.Description,
            program.DurationHours,
            program.IsActive,
            program.CreatedAt,
            program.Requirements
                .OrderBy(x => x.DisplayOrder)
                .Select(x => new TrainingProgramRequirementDto(
                    x.Id,
                    x.Name,
                    x.Description,
                    x.IsRequired,
                    x.DisplayOrder
                ))
                .ToList()
        );
    }
}
