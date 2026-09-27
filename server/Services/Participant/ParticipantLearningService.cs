using System.Text.Json;

using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Participant.Learning;
using server.Services.Interfaces;

namespace server.Services.Participant;

public class ParticipantLearningService
    : IParticipantLearningService
{
    private readonly ApplicationDbContext _context;

    public ParticipantLearningService(
        ApplicationDbContext context)
    {
        _context = context;
    }

    // =========================================================
    // GET LEARNING MATERIAL
    // =========================================================

    public async Task<ParticipantLearningMaterialDto>
        GetLearningMaterialAsync(
            Guid learningMaterialId,
            Guid participantUserId)
    {
        var material =
            await _context.LearningMaterials
                .AsNoTracking()
                .Include(x => x.Modules)
                    .ThenInclude(x => x.Sections)
                .FirstOrDefaultAsync(
                    x => x.Id == learningMaterialId);

        if (material == null)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
        }

        var modules =
            material.Modules
                .OrderBy(x => x.DisplayOrder)
                .ThenBy(x => x.ModuleNumber)
                .Select(MapModule)
                .ToList();

        return new ParticipantLearningMaterialDto
        {
            Id = material.Id,

            Title = material.Title,

            Description = material.Description,

            FileName = material.FileName,

            ContentType = material.ContentType,

            FileSize = material.FileSize,

            ExtractedText = material.ExtractedText,

            IsPublished = material.IsPublished,

            CreatedAt = material.CreatedAt,

            UpdatedAt = material.UpdatedAt,

            Modules = modules
        };
    }

    // =========================================================
    // GET MODULE
    // =========================================================

    public async Task<ParticipantLearningModuleDto>
        GetModuleAsync(
            Guid moduleId,
            Guid participantUserId)
    {
        var module =
            await _context.LearningModules
                .AsNoTracking()
                .Include(x => x.Sections)
                .FirstOrDefaultAsync(
                    x => x.Id == moduleId);

        if (module == null)
        {
            throw new KeyNotFoundException(
                "Learning module not found.");
        }

        return MapModule(module);
    }

    // =========================================================
    // GET SECTION
    // =========================================================

    public async Task<ParticipantLearningSectionDto>
        GetSectionAsync(
            Guid sectionId,
            Guid participantUserId)
    {
        var section =
            await _context.LearningSections
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.Id == sectionId);

        if (section == null)
        {
            throw new KeyNotFoundException(
                "Learning section not found.");
        }

        return MapSection(section);
    }

    // =========================================================
    // MAP MODULE
    // =========================================================

    private static ParticipantLearningModuleDto
        MapModule(
            server.Models.Learning.LearningModule module)
    {
        return new ParticipantLearningModuleDto
        {
            Id = module.Id,

            ModuleNumber = module.ModuleNumber,

            Title = module.Title,

            Description = module.Description,

            // -------------------------------------------------
            // AI GENERATED CONTENT
            // -------------------------------------------------

            WelcomeContent =
                module.WelcomeContent,

            LearningObjectives =
                DeserializeStringList(
                    module.LearningObjectives),

            Summary =
                module.Summary,

            KeyTakeaways =
                DeserializeStringList(
                    module.KeyTakeaways),

            // -------------------------------------------------
            // TRAINER CREATED SECTIONS
            // -------------------------------------------------

            Sections =
                module.Sections
                    .OrderBy(x => x.DisplayOrder)
                    .ThenBy(x => x.SectionNumber)
                    .Select(MapSection)
                    .ToList()
        };
    }

    // =========================================================
    // MAP SECTION
    // =========================================================

    private static ParticipantLearningSectionDto
        MapSection(
            server.Models.Learning.LearningSection section)
    {
        return new ParticipantLearningSectionDto
        {
            Id = section.Id,

            SectionNumber =
                section.SectionNumber,

            Title =
                section.Title,

            ContentType =
                section.ContentType,

            Content =
                section.Content,

            MediaUrl =
                section.MediaUrl,

            DisplayOrder =
                section.DisplayOrder
        };
    }

    // =========================================================
    // DESERIALIZE AI LIST
    // =========================================================

    private static List<string>
        DeserializeStringList(
            string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return [];
        }

        try
        {
            var result =
                JsonSerializer.Deserialize<List<string>>(
                    json);

            return result ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }
}