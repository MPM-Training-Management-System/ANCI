using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Training;
using server.Interfaces.Training;
using server.Models.Training;

namespace server.Services.Training;

public class TrainingProgramService : ITrainingProgramService
{
    private readonly ApplicationDbContext _context;

    public TrainingProgramService(
        ApplicationDbContext context)
    {
        _context = context;
    }


    // =========================================================
    // GET ALL TRAINING PROGRAMS
    // =========================================================

    public async Task<IEnumerable<TrainingProgramDto>>
        GetAllAsync()
    {
        return await _context.TrainingPrograms
            .AsNoTracking()
            .Include(x => x.Requirements)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x =>
                new TrainingProgramDto(
                    x.Id,
                    x.ProgramCode,
                    x.Name,
                    x.Description,
                    x.DurationHours,
                    x.IsActive,
                    x.CreatedAt,

                    x.Requirements
                        .OrderBy(r => r.DisplayOrder)
                        .Select(r =>
                            new TrainingProgramRequirementDto(
                                r.Id,
                                r.Name,
                                r.Description,
                                r.IsRequired,
                                r.DisplayOrder
                            )
                        )
                        .ToList()
                )
            )
            .ToListAsync();
    }


    // =========================================================
    // GET TRAINING PROGRAM BY ID
    // =========================================================

    public async Task<TrainingProgramDto?>
        GetByIdAsync(Guid id)
    {
        return await _context.TrainingPrograms
            .AsNoTracking()
            .Include(x => x.Requirements)
            .Where(x => x.Id == id)
            .Select(x =>
                new TrainingProgramDto(
                    x.Id,
                    x.ProgramCode,
                    x.Name,
                    x.Description,
                    x.DurationHours,
                    x.IsActive,
                    x.CreatedAt,

                    x.Requirements
                        .OrderBy(r => r.DisplayOrder)
                        .Select(r =>
                            new TrainingProgramRequirementDto(
                                r.Id,
                                r.Name,
                                r.Description,
                                r.IsRequired,
                                r.DisplayOrder
                            )
                        )
                        .ToList()
                )
            )
            .FirstOrDefaultAsync();
    }


    // =========================================================
    // CREATE TRAINING PROGRAM
    // =========================================================

    public async Task<TrainingProgramDto>
        CreateAsync(
            CreateTrainingProgramRequest request)
    {
        // -----------------------------------------------------
        // Validate Program Code
        // -----------------------------------------------------

        if (
            string.IsNullOrWhiteSpace(
                request.ProgramCode)
        )
        {
            throw new ArgumentException(
                "Program code is required."
            );
        }


        // -----------------------------------------------------
        // Validate Name
        // -----------------------------------------------------

        if (
            string.IsNullOrWhiteSpace(
                request.Name)
        )
        {
            throw new ArgumentException(
                "Training program name is required."
            );
        }


        // -----------------------------------------------------
        // Validate Duration
        // -----------------------------------------------------

        if (
            request.DurationHours <= 0
        )
        {
            throw new ArgumentException(
                "Duration hours must be greater than zero."
            );
        }


        // -----------------------------------------------------
        // Normalize Program Code
        // -----------------------------------------------------

        var programCode =
            request.ProgramCode.Trim();


        // -----------------------------------------------------
        // Check Duplicate Program Code
        // -----------------------------------------------------

        var exists =
            await _context.TrainingPrograms
                .AnyAsync(
                    x =>
                        x.ProgramCode ==
                        programCode
                );

        if (exists)
        {
            throw new InvalidOperationException(
                "A training program with this program code already exists."
            );
        }


        // -----------------------------------------------------
        // Validate Requirements
        // -----------------------------------------------------

        var requirements =
            request.Requirements ?? new List<
                CreateTrainingProgramRequirementRequest
            >();


        var duplicateRequirementNames =
            requirements
                .Where(x =>
                    !string.IsNullOrWhiteSpace(
                        x.Name))
                .GroupBy(x =>
                    x.Name.Trim(),
                    StringComparer.OrdinalIgnoreCase)
                .Where(x =>
                    x.Count() > 1)
                .Select(x =>
                    x.Key)
                .ToList();


        if (
            duplicateRequirementNames.Any()
        )
        {
            throw new InvalidOperationException(
                "Duplicate enrollment requirement names are not allowed."
            );
        }


        foreach (
            var requirement in requirements
        )
        {
            if (
                string.IsNullOrWhiteSpace(
                    requirement.Name)
            )
            {
                throw new ArgumentException(
                    "Enrollment requirement name is required."
                );
            }

            if (
                requirement.DisplayOrder < 0
            )
            {
                throw new ArgumentException(
                    "Enrollment requirement display order cannot be negative."
                );
            }
        }


        // -----------------------------------------------------
        // Create Training Program
        // -----------------------------------------------------

        var program =
            new TrainingProgram
            {
                Id =
                    Guid.NewGuid(),

                ProgramCode =
                    programCode,

                Name =
                    request.Name.Trim(),

                Description =
                    request.Description?.Trim(),

                DurationHours =
                    request.DurationHours,

                IsActive =
                    true,

                CreatedAt =
                    DateTime.UtcNow
            };


        // -----------------------------------------------------
        // Add Enrollment Requirements
        // -----------------------------------------------------

        program.Requirements =
            requirements
                .OrderBy(x =>
                    x.DisplayOrder)
                .Select(
                    (requirement, index) =>
                        new TrainingProgramRequirement
                        {
                            Id =
                                Guid.NewGuid(),

                            TrainingProgramId =
                                program.Id,

                            Name =
                                requirement.Name.Trim(),

                            Description =
                                string.IsNullOrWhiteSpace(
                                    requirement.Description)
                                    ? null
                                    : requirement.Description.Trim(),

                            IsRequired =
                                requirement.IsRequired,

                            DisplayOrder =
                                requirement.DisplayOrder
                        }
                )
                .ToList();


        // -----------------------------------------------------
        // Save
        // -----------------------------------------------------

        _context.TrainingPrograms.Add(
            program
        );

        await _context.SaveChangesAsync();


        // -----------------------------------------------------
        // Return DTO
        // -----------------------------------------------------

        return new TrainingProgramDto(
            program.Id,
            program.ProgramCode,
            program.Name,
            program.Description,
            program.DurationHours,
            program.IsActive,
            program.CreatedAt,

            program.Requirements
                .OrderBy(x =>
                    x.DisplayOrder)
                .Select(x =>
                    new TrainingProgramRequirementDto(
                        x.Id,
                        x.Name,
                        x.Description,
                        x.IsRequired,
                        x.DisplayOrder
                    )
                )
                .ToList()
        );
    }


    // =========================================================
    // UPDATE TRAINING PROGRAM
    // =========================================================
public async Task UpdateAsync(
    Guid id,
    UpdateTrainingProgramRequest request)
{
    // =========================================================
    // FIND PROGRAM
    // =========================================================

    var program =
        await _context.TrainingPrograms
            .Include(x => x.Requirements)
            .FirstOrDefaultAsync(x => x.Id == id);

    if (program is null)
    {
        throw new KeyNotFoundException(
            "Training program not found."
        );
    }


    // =========================================================
    // VALIDATE PROGRAM CODE
    // =========================================================

    if (string.IsNullOrWhiteSpace(request.ProgramCode))
    {
        throw new ArgumentException(
            "Program code is required."
        );
    }


    // =========================================================
    // VALIDATE NAME
    // =========================================================

    if (string.IsNullOrWhiteSpace(request.Name))
    {
        throw new ArgumentException(
            "Training program name is required."
        );
    }


    // =========================================================
    // VALIDATE DURATION
    // =========================================================

    if (request.DurationHours <= 0)
    {
        throw new ArgumentException(
            "Duration hours must be greater than zero."
        );
    }


    // =========================================================
    // NORMALIZE PROGRAM CODE
    // =========================================================

    var programCode =
        request.ProgramCode.Trim();


    // =========================================================
    // CHECK DUPLICATE PROGRAM CODE
    // =========================================================

    var duplicate =
        await _context.TrainingPrograms
            .AnyAsync(x =>
                x.Id != id &&
                x.ProgramCode == programCode
            );

    if (duplicate)
    {
        throw new InvalidOperationException(
            "A training program with this program code already exists."
        );
    }


    // =========================================================
    // VALIDATE REQUIREMENTS
    // =========================================================

    var requirements =
        request.Requirements ??
        new List<CreateTrainingProgramRequirementRequest>();


    var duplicateRequirementNames =
        requirements
            .Where(x =>
                !string.IsNullOrWhiteSpace(x.Name))
            .GroupBy(
                x => x.Name.Trim(),
                StringComparer.OrdinalIgnoreCase
            )
            .Where(x => x.Count() > 1)
            .Select(x => x.Key)
            .ToList();


    if (duplicateRequirementNames.Any())
    {
        throw new InvalidOperationException(
            "Duplicate enrollment requirement names are not allowed."
        );
    }


    foreach (var requirement in requirements)
    {
        if (string.IsNullOrWhiteSpace(requirement.Name))
        {
            throw new ArgumentException(
                "Enrollment requirement name is required."
            );
        }

        if (requirement.DisplayOrder < 0)
        {
            throw new ArgumentException(
                "Enrollment requirement display order cannot be negative."
            );
        }
    }


    // =========================================================
    // UPDATE PROGRAM
    // =========================================================

    program.ProgramCode =
        programCode;

    program.Name =
        request.Name.Trim();

    program.Description =
        string.IsNullOrWhiteSpace(request.Description)
            ? null
            : request.Description.Trim();

    program.DurationHours =
        request.DurationHours;


    // =========================================================
    // DELETE OLD REQUIREMENTS
    // =========================================================

    var oldRequirements =
        await _context.TrainingProgramRequirements
            .Where(x =>
                x.TrainingProgramId == id)
            .ToListAsync();


    if (oldRequirements.Count > 0)
    {
        _context.TrainingProgramRequirements
            .RemoveRange(oldRequirements);

        await _context.SaveChangesAsync();
    }


    // =========================================================
    // ADD NEW REQUIREMENTS
    // =========================================================

    var newRequirements =
        requirements
            .OrderBy(x => x.DisplayOrder)
            .Select(requirement =>
                new TrainingProgramRequirement
                {
                    Id = Guid.NewGuid(),

                    TrainingProgramId =
                        program.Id,

                    Name =
                        requirement.Name.Trim(),

                    Description =
                        string.IsNullOrWhiteSpace(
                            requirement.Description)
                            ? null
                            : requirement.Description.Trim(),

                    IsRequired =
                        requirement.IsRequired,

                    DisplayOrder =
                        requirement.DisplayOrder
                }
            )
            .ToList();


    if (newRequirements.Count > 0)
    {
        await _context.TrainingProgramRequirements
            .AddRangeAsync(newRequirements);
    }


    // =========================================================
    // SAVE PROGRAM + NEW REQUIREMENTS
    // =========================================================

    await _context.SaveChangesAsync();
}

    // =========================================================
    // DELETE TRAINING PROGRAM
    // =========================================================

    public async Task DeleteAsync(Guid id)
{
    var program =
        await _context.TrainingPrograms
            .Include(x => x.Batches)
            .FirstOrDefaultAsync(
                x => x.Id == id
            );

    if (program is null)
    {
        throw new KeyNotFoundException(
            "Training program not found."
        );
    }

    if (program.Batches.Any())
    {
        throw new InvalidOperationException(
            "A training program with existing batches cannot be deleted."
        );
    }

    _context.TrainingPrograms.Remove(program);

    await _context.SaveChangesAsync();
}
}