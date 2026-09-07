using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Training.LearningMaterials;
using server.Enums;
using server.Models.Learning;
using server.Services.Interfaces;

namespace server.Services;

public class LearningProgressService
    : ILearningProgressService
{
    private readonly ApplicationDbContext _context;

    public LearningProgressService(
        ApplicationDbContext context)
    {
        _context = context;
    }

    // =========================================================
    // GET MATERIAL PROGRESS
    // =========================================================

    public async Task<LearningMaterialProgressDto>
        GetMaterialProgressAsync(
            Guid participantUserId,
            Guid materialId)
    {
        // -----------------------------------------------------
        // FIND LEARNING MATERIAL
        // -----------------------------------------------------

        var material =
            await _context.LearningMaterials
                .AsNoTracking()
                .Include(x => x.TrainingBatch)
                .Include(x => x.Modules)
                    .ThenInclude(x => x.Sections)
                .FirstOrDefaultAsync(
                    x => x.Id == materialId);

        if (material is null)
        {
            throw new KeyNotFoundException(
                "Learning material was not found.");
        }


        // -----------------------------------------------------
        // FIND PARTICIPANT ENROLLMENT
        // -----------------------------------------------------

        var enrollment =
            await _context.Enrollments
                .AsNoTracking()
                .Include(x => x.ParticipantProfile)
                .FirstOrDefaultAsync(
                    x =>
                        x.ParticipantProfile.UserId ==
                            participantUserId
                        &&
                        x.TrainingBatchId ==
                            material.TrainingBatchId
                        &&
                        x.Status ==
                            EnrollmentStatus.Approved
                );

        if (enrollment is null)
        {
            throw new UnauthorizedAccessException(
                "You are not enrolled in this training.");
        }


        // -----------------------------------------------------
        // GET PROGRESS
        // -----------------------------------------------------

        var sectionIds =
            material.Modules
                .SelectMany(x => x.Sections)
                .Select(x => x.Id)
                .ToList();

        var progressRecords =
            await _context.LearningSectionProgresses
                .AsNoTracking()
                .Where(
                    x =>
                        x.EnrollmentId ==
                            enrollment.Id
                        &&
                        sectionIds.Contains(
                            x.LearningSectionId)
                )
                .ToListAsync();


        // -----------------------------------------------------
        // BUILD MODULE DTOs
        // -----------------------------------------------------

        var modules =
            material.Modules
                .OrderBy(x => x.DisplayOrder)
                .Select(module =>
                {
                    var sections =
                        module.Sections
                            .OrderBy(
                                x => x.DisplayOrder)
                            .Select(section =>
                            {
                                var progress =
                                    progressRecords
                                        .FirstOrDefault(
                                            x =>
                                                x.LearningSectionId ==
                                                section.Id);

                                return new LearningSectionProgressDto
                                {
                                    SectionId =
                                        section.Id,

                                    SectionNumber =
                                        section.SectionNumber,

                                    Title =
                                        section.Title,

                                    IsRead =
                                        progress?.IsRead
                                        ?? false,

                                    ReadAt =
                                        progress?.ReadAt,

                                    LastReadAt =
                                        progress?.LastReadAt
                                };
                            })
                            .ToList();

                    var completedSections =
                        sections.Count(
                            x => x.IsRead);

                    var totalSections =
                        sections.Count;

                    var lastReadSection =
                        sections
                            .Where(
                                x => x.IsRead)
                            .OrderByDescending(
                                x =>
                                    x.LastReadAt)
                            .FirstOrDefault();

                    return new LearningModuleProgressDto
                    {
                        ModuleId =
                            module.Id,

                        ModuleNumber =
                            module.ModuleNumber,

                        Title =
                            module.Title,

                        TotalSections =
                            totalSections,

                        CompletedSections =
                            completedSections,

                        ProgressPercentage =
                            totalSections == 0
                                ? 0
                                : Math.Round(
                                    completedSections
                                    * 100m
                                    / totalSections,
                                    2),

                        LastReadSectionId =
                            lastReadSection
                                ?.SectionId,

                        Sections =
                            sections
                    };
                })
                .ToList();


        // -----------------------------------------------------
        // MATERIAL TOTALS
        // -----------------------------------------------------

        var totalModules =
            modules.Count;

        var completedModules =
            modules.Count(
                x =>
                    x.TotalSections > 0
                    &&
                    x.CompletedSections ==
                        x.TotalSections);

        var totalSections =
            modules.Sum(
                x => x.TotalSections);

        var completedSectionsTotal =
            modules.Sum(
                x => x.CompletedSections);


        // -----------------------------------------------------
        // LAST READ
        // -----------------------------------------------------

        var lastRead =
            modules
                .SelectMany(
                    module =>
                        module.Sections.Select(
                            section =>
                                new
                                {
                                    ModuleId =
                                        module.ModuleId,

                                    SectionId =
                                        section.SectionId,

                                    LastReadAt =
                                        section.LastReadAt
                                }))
                .Where(
                    x =>
                        x.LastReadAt.HasValue)
                .OrderByDescending(
                    x =>
                        x.LastReadAt)
                .FirstOrDefault();


        // -----------------------------------------------------
        // RETURN
        // -----------------------------------------------------

        return new LearningMaterialProgressDto
        {
            LearningMaterialId =
                material.Id,

            TotalModules =
                totalModules,

            CompletedModules =
                completedModules,

            TotalSections =
                totalSections,

            CompletedSections =
                completedSectionsTotal,

            ProgressPercentage =
                totalSections == 0
                    ? 0
                    : Math.Round(
                        completedSectionsTotal
                        * 100m
                        / totalSections,
                        2),

            LastReadModuleId =
                lastRead?.ModuleId,

            LastReadSectionId =
                lastRead?.SectionId,

            Modules =
                modules
        };
    }


    // =========================================================
    // MARK SECTION AS READ
    // =========================================================

    public async Task<LearningMaterialProgressDto>
        MarkSectionAsReadAsync(
            Guid participantUserId,
            Guid sectionId)
    {
        // -----------------------------------------------------
        // FIND SECTION
        // -----------------------------------------------------

        var section =
            await _context.LearningSections
                .AsNoTracking()
                .Include(x => x.LearningModule)
                    .ThenInclude(x =>
                        x.LearningMaterial)
                .FirstOrDefaultAsync(
                    x => x.Id == sectionId);

        if (section is null)
        {
            throw new KeyNotFoundException(
                "Learning section was not found.");
        }


        var material =
            section
                .LearningModule
                .LearningMaterial;


        // -----------------------------------------------------
        // FIND PARTICIPANT ENROLLMENT
        // -----------------------------------------------------

        var enrollment =
            await _context.Enrollments
                .Include(x => x.ParticipantProfile)
                .FirstOrDefaultAsync(
                    x =>
                        x.ParticipantProfile.UserId ==
                            participantUserId
                        &&
                        x.TrainingBatchId ==
                            material.TrainingBatchId
                        &&
                        x.Status ==
                            EnrollmentStatus.Approved
                );

        if (enrollment is null)
        {
            throw new UnauthorizedAccessException(
                "You are not enrolled in this training.");
        }


        // -----------------------------------------------------
        // FIND EXISTING PROGRESS
        // -----------------------------------------------------

        var progress =
            await _context.LearningSectionProgresses
                .FirstOrDefaultAsync(
                    x =>
                        x.EnrollmentId ==
                            enrollment.Id
                        &&
                        x.LearningSectionId ==
                            sectionId);


        var now =
            DateTime.UtcNow;


        // -----------------------------------------------------
        // CREATE
        // -----------------------------------------------------

        if (progress is null)
        {
            progress =
                new LearningSectionProgress
                {
                    Id =
                        Guid.NewGuid(),

                    EnrollmentId =
                        enrollment.Id,

                    LearningSectionId =
                        sectionId,

                    IsRead =
                        true,

                    ReadAt =
                        now,

                    LastReadAt =
                        now
                };

            _context
                .LearningSectionProgresses
                .Add(progress);
        }

        // -----------------------------------------------------
        // UPDATE
        // -----------------------------------------------------

        else
        {
            progress.IsRead =
                true;

            progress.LastReadAt =
                now;
        }


        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        await _context.SaveChangesAsync();


        // -----------------------------------------------------
        // RETURN UPDATED PROGRESS
        // -----------------------------------------------------

        return await GetMaterialProgressAsync(
            participantUserId,
            material.Id);
    }
}