using System.Text.Json;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Trainer.Learning;
using server.DTOs.Training.LearningMaterials;
using server.Models.Learning;
using server.Services.Interfaces;

namespace server.Services.Training;

public class LearningMaterialService
    : ILearningMaterialService
{
    private readonly ApplicationDbContext _context;
    private readonly ICloudinaryService _cloudinary;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IDocumentTextExtractionService _documentExtractor;
    private readonly ILearningMaterialAiService _learningMaterialAiService;
    private readonly ILearningModuleChunkingService _learningModuleChunkingService;

    public LearningMaterialService(
        ApplicationDbContext context,
        ICloudinaryService cloudinary,
        IHttpClientFactory httpClientFactory,
        IDocumentTextExtractionService documentExtractor,
        ILearningMaterialAiService learningMaterialAiService,
        ILearningModuleChunkingService learningModuleChunkingService)
    {
        _context = context;
        _cloudinary = cloudinary;
        _httpClientFactory = httpClientFactory;
        _documentExtractor = documentExtractor;
        _learningMaterialAiService = learningMaterialAiService;
        _learningModuleChunkingService = learningModuleChunkingService;
    }

    // =========================================================
    // GET MATERIALS BY TRAINING BATCH
    // =========================================================

    public async Task<IReadOnlyList<LearningMaterialDto>>
        GetByBatchIdAsync(
            Guid trainingBatchId)
    {
        var batchExists =
            await _context.TrainingBatches
                .AnyAsync(x =>
                    x.Id == trainingBatchId);

        if (!batchExists)
        {
            throw new KeyNotFoundException(
                "Training batch not found.");
        }

        var materials =
            await _context.LearningMaterials
                .AsNoTracking()
                .Include(x => x.TrainingBatch)
                .Where(x =>
                    x.TrainingBatchId ==
                    trainingBatchId)
                .OrderBy(x => x.CreatedAt)
                .ToListAsync();

        return materials
            .Select(MapToDto)
            .ToList();
    }

    // =========================================================
    // GET MATERIAL BY ID
    // =========================================================

    public async Task<LearningMaterialDto>
        GetByIdAsync(
            Guid id)
    {
        var material =
            await _context.LearningMaterials
                .AsNoTracking()
                .Include(x => x.TrainingBatch)
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (material == null)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
        }

        return MapToDto(material);
    }

    // =========================================================
    // CREATE LEARNING MATERIAL
    // =========================================================

    public async Task<LearningMaterialDto>
        CreateAsync(
            Guid trainerUserId,
            CreateLearningMaterialRequest request)
    {
        if (request is null)
        {
            throw new ArgumentNullException(
                nameof(request));
        }

        if (string.IsNullOrWhiteSpace(
                request.Title))
        {
            throw new ArgumentException(
                "Learning material title is required.");
        }

        if (string.IsNullOrWhiteSpace(
                request.MaterialType))
        {
            throw new ArgumentException(
                "Material type is required.");
        }

        // ---------------------------------------------------------
        // FIND TRAINER PROFILE
        // ---------------------------------------------------------

        var trainerProfile =
            await _context.TrainerProfiles
                .FirstOrDefaultAsync(x =>
                    x.UserId == trainerUserId &&
                    x.IsActive);

        if (trainerProfile == null)
        {
            throw new KeyNotFoundException(
                "Trainer profile not found.");
        }

        // ---------------------------------------------------------
        // FIND ACTIVE TRAINER ASSIGNMENT
        // ---------------------------------------------------------

        var assignment =
            await _context.TrainerAssignments
                .Include(x => x.TrainingBatch)
                .FirstOrDefaultAsync(x =>
                    x.TrainerProfileId ==
                        trainerProfile.Id &&
                    x.IsActive);

        if (assignment == null)
        {
            throw new InvalidOperationException(
                "You are not assigned to a training batch.");
        }

        // ---------------------------------------------------------
        // CREATE MATERIAL
        // ---------------------------------------------------------

        var material =
            new LearningMaterial
            {
                Id = Guid.NewGuid(),

                TrainingBatchId =
                    assignment.TrainingBatchId,

                Title =
                    request.Title.Trim(),

                Description =
                    string.IsNullOrWhiteSpace(
                        request.Description)
                        ? null
                        : request.Description.Trim(),

                MaterialType =
                    request.MaterialType.Trim(),

                FileUrl = string.Empty,

                ExtractedText = null,

                IsPublished = false,

                CreatedAt =
                    DateTime.UtcNow,

                UpdatedAt = null
            };

        await _context.LearningMaterials
            .AddAsync(material);

        await _context.SaveChangesAsync();

        material.TrainingBatch =
            assignment.TrainingBatch;

        return MapToDto(material);
    }

    // =========================================================
    // UPDATE LEARNING MATERIAL
    // =========================================================

    public async Task<LearningMaterialDto>
        UpdateAsync(
            Guid id,
            UpdateLearningMaterialRequest request)
    {
        if (request is null)
        {
            throw new ArgumentNullException(
                nameof(request));
        }

        var material =
            await _context.LearningMaterials
                .Include(x => x.TrainingBatch)
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (material == null)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
        }

        if (string.IsNullOrWhiteSpace(
                request.Title))
        {
            throw new ArgumentException(
                "Learning material title is required.");
        }

        if (string.IsNullOrWhiteSpace(
                request.MaterialType))
        {
            throw new ArgumentException(
                "Material type is required.");
        }

        material.Title =
            request.Title.Trim();

        material.Description =
            string.IsNullOrWhiteSpace(
                request.Description)
                ? null
                : request.Description.Trim();

        material.MaterialType =
            request.MaterialType.Trim();

        material.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(material);
    }

    // =========================================================
    // DELETE LEARNING MATERIAL
    // =========================================================

    public async Task DeleteAsync(
        Guid id)
    {
        var material =
            await _context.LearningMaterials
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (material == null)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
        }

        _context.LearningMaterials
            .Remove(material);

        await _context.SaveChangesAsync();
    }

    // =========================================================
    // PUBLISH LEARNING MATERIAL
    // =========================================================

    public async Task<LearningMaterialDto>
        PublishAsync(
            Guid id)
    {
        var material =
            await _context.LearningMaterials
                .Include(x => x.TrainingBatch)
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (material == null)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
        }

        if (string.IsNullOrWhiteSpace(
                material.FileUrl))
        {
            throw new InvalidOperationException(
                "A file must be uploaded before the learning material can be published.");
        }

        material.IsPublished = true;

        material.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(material);
    }

    // =========================================================
    // MAP MATERIAL TO DTO
    // =========================================================

    private static LearningMaterialDto
        MapToDto(
            LearningMaterial material)
    {
        return new LearningMaterialDto
        {
            Id =
                material.Id,

            TrainingBatchId =
                material.TrainingBatchId,

            BatchCode =
                material.TrainingBatch?.BatchCode ??
                string.Empty,

            Title =
                material.Title,

            Description =
                material.Description,

            MaterialType =
                material.MaterialType,

            FileUrl =
                material.FileUrl,

            ExtractedText =
                material.ExtractedText,

            FileName =
                material.FileName,

            ContentType =
                material.ContentType,

            FileSize =
                material.FileSize,

            IsPublished =
                material.IsPublished,

            CreatedAt =
                material.CreatedAt,

            UpdatedAt =
                material.UpdatedAt
        };
    }

    // =========================================================
    // GET MODULES
    // =========================================================

    public async Task<IReadOnlyList<LearningModuleDto>>
        GetModulesAsync(
            Guid learningMaterialId)
    {
        var materialExists =
            await _context.LearningMaterials
                .AnyAsync(x =>
                    x.Id == learningMaterialId);

        if (!materialExists)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
        }

        var modules =
            await _context.LearningModules
                .AsNoTracking()
                .Where(x =>
                    x.LearningMaterialId ==
                    learningMaterialId)
                .Include(x => x.Sections)
                .OrderBy(x => x.DisplayOrder)
                .ThenBy(x => x.ModuleNumber)
                .ToListAsync();

        return modules
            .Select(MapModuleToDto)
            .ToList();
    }

    // =========================================================
    // MAP MODULE TO DTO
    // =========================================================

    private static LearningModuleDto
        MapModuleToDto(
            LearningModule module)
    {
        return new LearningModuleDto
        {
            Id =
                module.Id,

            LearningMaterialId =
                module.LearningMaterialId,

            ModuleNumber =
                module.ModuleNumber,

            Title =
                module.Title,

            Description =
                module.Description,

            // -------------------------------------------------
            // MODULE FILE
            // -------------------------------------------------

            FileUrl =
                module.FileUrl,

            FileName =
                module.FileName,

            ContentType =
                module.ContentType,

            FileSize =
                module.FileSize,

            ExtractedText =
                module.ExtractedText,

            // -------------------------------------------------
            // AI CONTENT
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

            DisplayOrder =
                module.DisplayOrder,

            CreatedAt =
                module.CreatedAt,

            UpdatedAt =
                module.UpdatedAt,

            SectionCount =
                module.Sections?.Count ?? 0
        };
    }

    // =========================================================
    // JSON STRING LIST HELPER
    // =========================================================

    private static List<string>
        DeserializeStringList(
            string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return [];
        }

        try
        {
            var result =
                JsonSerializer.Deserialize<List<string>>(
                    value);

            return result ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }

    // =========================================================
    // MAP SECTION TO DTO
    // =========================================================

    private static LearningSectionDto
        MapSectionToDto(
            LearningSection section)
    {
        return new LearningSectionDto
        {
            Id =
                section.Id,

            LearningModuleId =
                section.LearningModuleId,

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
                section.DisplayOrder,

            CreatedAt =
                section.CreatedAt,

            UpdatedAt =
                section.UpdatedAt
        };
    }

    // =========================================================
    // CREATE MODULE
    // =========================================================

    public async Task<LearningModuleDto>
        CreateModuleAsync(
            CreateLearningModuleRequest request)
    {
        if (request is null)
        {
            throw new ArgumentNullException(
                nameof(request));
        }

        var material =
            await _context.LearningMaterials
                .FirstOrDefaultAsync(x =>
                    x.Id ==
                    request.LearningMaterialId);

        if (material == null)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
        }

        if (request.ModuleNumber <= 0)
        {
            throw new ArgumentException(
                "Module number must be greater than zero.");
        }

        if (string.IsNullOrWhiteSpace(
                request.Title))
        {
            throw new ArgumentException(
                "Module title is required.");
        }

        var duplicate =
            await _context.LearningModules
                .AnyAsync(x =>
                    x.LearningMaterialId ==
                        request.LearningMaterialId &&
                    x.ModuleNumber ==
                        request.ModuleNumber);

        if (duplicate)
        {
            throw new InvalidOperationException(
                "A module with this module number already exists.");
        }

        var module =
            new LearningModule
            {
                Id =
                    Guid.NewGuid(),

                LearningMaterialId =
                    request.LearningMaterialId,

                ModuleNumber =
                    request.ModuleNumber,

                Title =
                    request.Title.Trim(),

                Description =
                    string.IsNullOrWhiteSpace(
                        request.Description)
                        ? null
                        : request.Description.Trim(),

                // Module file starts empty.
                // Trainer may upload one later.
                FileUrl =
                    null,

                PublicId =
                    null,

                FileName =
                    null,

                ContentType =
                    null,

                FileSize =
                    null,

                ExtractedText =
                    null,

                // AI content starts empty.
                WelcomeContent =
                    null,

                LearningObjectives =
                    null,

                Summary =
                    null,

                KeyTakeaways =
                    null,

                DisplayOrder =
                    request.DisplayOrder,

                CreatedAt =
                    DateTime.UtcNow,

                UpdatedAt =
                    null,

                Sections = [],

                Chunks = []
            };

        await _context.LearningModules
            .AddAsync(module);

        await _context.SaveChangesAsync();

        return MapModuleToDto(module);
    }

    // =========================================================
    // UPDATE MODULE
    // =========================================================

    public async Task<LearningModuleDto>
        UpdateModuleAsync(
            Guid moduleId,
            UpdateLearningModuleRequest request)
    {
        if (request is null)
        {
            throw new ArgumentNullException(
                nameof(request));
        }

        var module =
            await _context.LearningModules
                .FirstOrDefaultAsync(x =>
                    x.Id == moduleId);

        if (module == null)
        {
            throw new KeyNotFoundException(
                "Learning module not found.");
        }

        if (request.ModuleNumber <= 0)
        {
            throw new ArgumentException(
                "Module number must be greater than zero.");
        }

        if (string.IsNullOrWhiteSpace(
                request.Title))
        {
            throw new ArgumentException(
                "Module title is required.");
        }

        var duplicate =
            await _context.LearningModules
                .AnyAsync(x =>
                    x.Id != moduleId &&
                    x.LearningMaterialId ==
                        module.LearningMaterialId &&
                    x.ModuleNumber ==
                        request.ModuleNumber);

        if (duplicate)
        {
            throw new InvalidOperationException(
                "A module with this module number already exists.");
        }

        module.ModuleNumber =
            request.ModuleNumber;

        module.Title =
            request.Title.Trim();

        module.Description =
            string.IsNullOrWhiteSpace(
                request.Description)
                ? null
                : request.Description.Trim();

        // ---------------------------------------------------------
        // AI CONTENT
        // ---------------------------------------------------------

        module.WelcomeContent =
            string.IsNullOrWhiteSpace(
                request.WelcomeContent)
                ? null
                : request.WelcomeContent.Trim();

        module.LearningObjectives =
            SerializeStringList(
                request.LearningObjectives);

        module.Summary =
            string.IsNullOrWhiteSpace(
                request.Summary)
                ? null
                : request.Summary.Trim();

        module.KeyTakeaways =
            SerializeStringList(
                request.KeyTakeaways);

        module.DisplayOrder =
            request.DisplayOrder;

        module.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapModuleToDto(module);
    }

    // =========================================================
    // SERIALIZE STRING LIST
    // =========================================================

    private static string?
        SerializeStringList(
            List<string>? values)
    {
        if (values is null ||
            values.Count == 0)
        {
            return null;
        }

        var cleanedValues =
            values
                .Where(x =>
                    !string.IsNullOrWhiteSpace(x))
                .Select(x =>
                    x.Trim())
                .ToList();

        if (cleanedValues.Count == 0)
        {
            return null;
        }

        return JsonSerializer.Serialize(
            cleanedValues);
    }

    // =========================================================
    // GENERATE AI MODULE CONTENT
    // =========================================================

    public async Task<LearningModuleDto>
        GenerateModuleAiContentAsync(
            Guid moduleId)
    {
        // ---------------------------------------------------------
        // FIND MODULE
        // ---------------------------------------------------------

        var module =
            await _context.LearningModules
                .FirstOrDefaultAsync(x =>
                    x.Id == moduleId);

        if (module == null)
        {
            throw new KeyNotFoundException(
                "Learning module not found.");
        }

        // ---------------------------------------------------------
        // FIND LEARNING MATERIAL
        // ---------------------------------------------------------

        var material =
            await _context.LearningMaterials
                .FirstOrDefaultAsync(x =>
                    x.Id ==
                    module.LearningMaterialId);

        if (material == null)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
        }

        // ---------------------------------------------------------
        // SELECT SOURCE
        //
        // Priority:
        // 1. Module extracted text
        // 2. Parent Learning Material extracted text
        // ---------------------------------------------------------

        var sourceText =
            !string.IsNullOrWhiteSpace(
                module.ExtractedText)
                ? module.ExtractedText
                : material.ExtractedText;

        if (string.IsNullOrWhiteSpace(
                sourceText))
        {
            throw new InvalidOperationException(
                "No extracted content is available for this module. " +
                "Upload and extract a module file, or extract the parent learning material first.");
        }

        // ---------------------------------------------------------
        // GENERATE AI CONTENT
        // ---------------------------------------------------------

        var aiResult =
            await _learningMaterialAiService
                .GenerateModuleContentAsync(
                    sourceText,
                    module.Title,
                    module.Description);

        // ---------------------------------------------------------
        // SAVE AI CONTENT
        // ---------------------------------------------------------

        module.WelcomeContent =
            aiResult.Welcome.Trim();

        module.LearningObjectives =
            JsonSerializer.Serialize(
                aiResult.LearningObjectives);

        module.Summary =
            aiResult.Summary.Trim();

        module.KeyTakeaways =
            JsonSerializer.Serialize(
                aiResult.KeyTakeaways);

        module.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // ---------------------------------------------------------
        // RETURN UPDATED MODULE
        // ---------------------------------------------------------

        return MapModuleToDto(module);
    }

    // =========================================================
    // DELETE MODULE
    // =========================================================

    public async Task DeleteModuleAsync(
        Guid moduleId)
    {
        var module =
            await _context.LearningModules
                .FirstOrDefaultAsync(x =>
                    x.Id == moduleId);

        if (module == null)
        {
            throw new KeyNotFoundException(
                "Learning module not found.");
        }

        _context.LearningModules
            .Remove(module);

        await _context.SaveChangesAsync();
    }

    // =========================================================
    // CREATE SECTION
    // =========================================================

    public async Task<LearningSectionDto>
        CreateSectionAsync(
            CreateLearningSectionRequest request)
    {
        if (request is null)
        {
            throw new ArgumentNullException(
                nameof(request));
        }

        var module =
            await _context.LearningModules
                .FirstOrDefaultAsync(x =>
                    x.Id ==
                    request.LearningModuleId);

        if (module == null)
        {
            throw new KeyNotFoundException(
                "Learning module not found.");
        }

        if (request.SectionNumber <= 0)
        {
            throw new ArgumentException(
                "Section number must be greater than zero.");
        }

        if (string.IsNullOrWhiteSpace(
                request.Title))
        {
            throw new ArgumentException(
                "Section title is required.");
        }

        var duplicate =
            await _context.LearningSections
                .AnyAsync(x =>
                    x.LearningModuleId ==
                        request.LearningModuleId &&
                    x.SectionNumber ==
                        request.SectionNumber);

        if (duplicate)
        {
            throw new InvalidOperationException(
                "A section with this section number already exists.");
        }

        var section =
            new LearningSection
            {
                Id =
                    Guid.NewGuid(),

                LearningModuleId =
                    request.LearningModuleId,

                SectionNumber =
                    request.SectionNumber,

                Title =
                    request.Title.Trim(),

                ContentType =
                    string.IsNullOrWhiteSpace(
                        request.ContentType)
                        ? "Text"
                        : request.ContentType.Trim(),

                Content =
                    request.Content,

                MediaUrl =
                    string.IsNullOrWhiteSpace(
                        request.MediaUrl)
                        ? null
                        : request.MediaUrl.Trim(),

                DisplayOrder =
                    request.DisplayOrder,

                CreatedAt =
                    DateTime.UtcNow,

                UpdatedAt =
                    null
            };

        await _context.LearningSections
            .AddAsync(section);

        await _context.SaveChangesAsync();

        return MapSectionToDto(section);
    }

    // =========================================================
    // GET SECTIONS
    // =========================================================

    public async Task<IReadOnlyList<LearningSectionDto>>
        GetSectionsAsync(
            Guid moduleId)
    {
        var moduleExists =
            await _context.LearningModules
                .AnyAsync(x =>
                    x.Id == moduleId);

        if (!moduleExists)
        {
            throw new KeyNotFoundException(
                "Learning module not found.");
        }

        var sections =
            await _context.LearningSections
                .AsNoTracking()
                .Where(x =>
                    x.LearningModuleId ==
                    moduleId)
                .OrderBy(x => x.DisplayOrder)
                .ThenBy(x => x.SectionNumber)
                .ToListAsync();

        return sections
            .Select(MapSectionToDto)
            .ToList();
    }

    // =========================================================
    // UPDATE SECTION
    // =========================================================

    public async Task<LearningSectionDto>
        UpdateSectionAsync(
            Guid sectionId,
            UpdateLearningSectionRequest request)
    {
        if (request is null)
        {
            throw new ArgumentNullException(
                nameof(request));
        }

        var section =
            await _context.LearningSections
                .FirstOrDefaultAsync(x =>
                    x.Id == sectionId);

        if (section == null)
        {
            throw new KeyNotFoundException(
                "Learning section not found.");
        }

        if (request.SectionNumber <= 0)
        {
            throw new ArgumentException(
                "Section number must be greater than zero.");
        }

        if (string.IsNullOrWhiteSpace(
                request.Title))
        {
            throw new ArgumentException(
                "Section title is required.");
        }

        var duplicate =
            await _context.LearningSections
                .AnyAsync(x =>
                    x.Id != sectionId &&
                    x.LearningModuleId ==
                        section.LearningModuleId &&
                    x.SectionNumber ==
                        request.SectionNumber);

        if (duplicate)
        {
            throw new InvalidOperationException(
                "A section with this section number already exists.");
        }

        section.SectionNumber =
            request.SectionNumber;

        section.Title =
            request.Title.Trim();

        section.ContentType =
            string.IsNullOrWhiteSpace(
                request.ContentType)
                ? "Text"
                : request.ContentType.Trim();

        section.Content =
            request.Content;

        section.MediaUrl =
            string.IsNullOrWhiteSpace(
                request.MediaUrl)
                ? null
                : request.MediaUrl.Trim();

        section.DisplayOrder =
            request.DisplayOrder;

        section.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapSectionToDto(section);
    }

    // =========================================================
    // DELETE SECTION
    // =========================================================

    public async Task DeleteSectionAsync(
        Guid sectionId)
    {
        var section =
            await _context.LearningSections
                .FirstOrDefaultAsync(x =>
                    x.Id == sectionId);

        if (section == null)
        {
            throw new KeyNotFoundException(
                "Learning section not found.");
        }

        _context.LearningSections
            .Remove(section);

        await _context.SaveChangesAsync();
    }

    // =========================================================
    // UPLOAD LEARNING MATERIAL FILE
    // =========================================================

    public async Task<LearningMaterialDto>
        UploadFileAsync(
            Guid id,
            UploadLearningMaterialRequest request)
    {
        if (request is null)
        {
            throw new ArgumentNullException(
                nameof(request));
        }

        if (request.File is null)
        {
            throw new ArgumentException(
                "Learning material file is required.");
        }

        if (request.File.Length == 0)
        {
            throw new ArgumentException(
                "The uploaded file is empty.");
        }

        var material =
            await _context.LearningMaterials
                .Include(x => x.TrainingBatch)
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (material == null)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
        }

        // ---------------------------------------------------------
        // ALLOWED FILE TYPES
        // ---------------------------------------------------------

        var allowedExtensions =
            new[]
            {
                ".pdf",
                ".docx",
                ".pptx"
            };

        var extension =
            Path.GetExtension(
                request.File.FileName)
                .ToLowerInvariant();

        if (!allowedExtensions.Contains(
                extension))
        {
            throw new ArgumentException(
                "Unsupported file type. " +
                "Allowed files are PDF, DOCX, and PPTX.");
        }

        // ---------------------------------------------------------
        // FILE SIZE
        // ---------------------------------------------------------

        const long maxFileSize =
            50 * 1024 * 1024;

        if (request.File.Length > maxFileSize)
        {
            throw new ArgumentException(
                "The uploaded file must not exceed 50 MB.");
        }

        // ---------------------------------------------------------
        // UPLOAD TO CLOUDINARY
        // ---------------------------------------------------------

        await using var uploadStream =
            request.File.OpenReadStream();

        var uploadResult =
            await _cloudinary.UploadDocumentAsync(
                uploadStream,
                request.File.FileName,
                $"ace-nextgen/learning-materials/{material.Id}");

        // ---------------------------------------------------------
        // SAVE FILE INFORMATION
        // ---------------------------------------------------------

        material.FileUrl =
            uploadResult.Url;

        material.PublicId =
            uploadResult.PublicId;

        material.FileName =
            request.File.FileName;

        material.ContentType =
            request.File.ContentType;

        material.FileSize =
            request.File.Length;

        material.IsPublished =
            false;

        material.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToDto(material);
    }

    // =========================================================
    // EXTRACT LEARNING MATERIAL TEXT
    // =========================================================

    public async Task<LearningMaterialExtractionDto>
        ExtractTextAsync(
            Guid id)
    {
        var material =
            await _context.LearningMaterials
                .FirstOrDefaultAsync(x =>
                    x.Id == id);

        if (material == null)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
        }

        if (string.IsNullOrWhiteSpace(
                material.FileUrl))
        {
            throw new InvalidOperationException(
                "No file has been uploaded for this learning material.");
        }

        if (string.IsNullOrWhiteSpace(
                material.FileName))
        {
            throw new InvalidOperationException(
                "Learning material file name is missing.");
        }

        // ---------------------------------------------------------
        // DOWNLOAD FILE
        // ---------------------------------------------------------

        var httpClient =
            _httpClientFactory.CreateClient();

        using var response =
            await httpClient.GetAsync(
                material.FileUrl,
                HttpCompletionOption.ResponseHeadersRead);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                "Unable to download the learning material file.");
        }

        const long maxFileSize =
            50 * 1024 * 1024;

        if (response.Content.Headers.ContentLength
            is long contentLength &&
            contentLength > maxFileSize)
        {
            throw new InvalidOperationException(
                "The learning material file exceeds the 50 MB limit.");
        }

        // ---------------------------------------------------------
        // COPY TO MEMORY
        // ---------------------------------------------------------

        await using var responseStream =
            await response.Content.ReadAsStreamAsync();

        await using var memoryStream =
            new MemoryStream();

        await responseStream.CopyToAsync(
            memoryStream);

        if (memoryStream.Length > maxFileSize)
        {
            throw new InvalidOperationException(
                "The learning material file exceeds the 50 MB limit.");
        }

        memoryStream.Position = 0;

        // ---------------------------------------------------------
        // EXTRACT DOCUMENT
        // ---------------------------------------------------------

        var extraction =
            await _documentExtractor.ExtractAsync(
                memoryStream,
                material.FileName,
                material.ContentType);

        if (string.IsNullOrWhiteSpace(
                extraction.Text))
        {
            throw new InvalidOperationException(
                "No readable text was found in the learning material.");
        }

        // ---------------------------------------------------------
        // SAVE EXTRACTED CONTENT
        // ---------------------------------------------------------

        material.ExtractedText =
            extraction.Text;

        material.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // ---------------------------------------------------------
        // RETURN EXTRACTION RESULT
        // ---------------------------------------------------------

        return new LearningMaterialExtractionDto
        {
            LearningMaterialId =
                material.Id,

            FileName =
                material.FileName,

            ContentType =
                material.ContentType,

            Text =
                extraction.Text,

            CharacterCount =
                extraction.Text.Length,

            PageCount =
                extraction.PageCount
        };
    }

    // =========================================================
    // UPLOAD MODULE FILE
    // =========================================================

    public async Task<LearningModuleDto>
        UploadModuleFileAsync(
            Guid moduleId,
            IFormFile file)
    {
        if (file is null)
        {
            throw new ArgumentException(
                "Module file is required.");
        }

        if (file.Length == 0)
        {
            throw new ArgumentException(
                "The uploaded module file is empty.");
        }

        var module =
            await _context.LearningModules
                .FirstOrDefaultAsync(x =>
                    x.Id == moduleId);

        if (module == null)
        {
            throw new KeyNotFoundException(
                "Learning module not found.");
        }

        // ---------------------------------------------------------
        // ALLOWED FILE TYPES
        // ---------------------------------------------------------

        var allowedExtensions =
            new[]
            {
                ".pdf",
                ".docx",
                ".pptx"
            };

        var extension =
            Path.GetExtension(
                file.FileName)
                .ToLowerInvariant();

        if (!allowedExtensions.Contains(
                extension))
        {
            throw new ArgumentException(
                "Unsupported file type. " +
                "Allowed files are PDF, DOCX, and PPTX.");
        }

        // ---------------------------------------------------------
        // FILE SIZE
        // ---------------------------------------------------------

        const long maxFileSize =
            50 * 1024 * 1024;

        if (file.Length > maxFileSize)
        {
            throw new ArgumentException(
                "The uploaded module file must not exceed 50 MB.");
        }

        // ---------------------------------------------------------
        // UPLOAD TO CLOUDINARY
        // ---------------------------------------------------------

        await using var uploadStream =
            file.OpenReadStream();

        var uploadResult =
            await _cloudinary.UploadDocumentAsync(
                uploadStream,
                file.FileName,
                $"ace-nextgen/learning-materials/{module.LearningMaterialId}/modules/{module.Id}");

        // ---------------------------------------------------------
        // SAVE MODULE FILE INFORMATION
        // ---------------------------------------------------------

        module.FileUrl =
            uploadResult.Url;

        module.PublicId =
            uploadResult.PublicId;

        module.FileName =
            file.FileName;

        module.ContentType =
            file.ContentType;

        module.FileSize =
            file.Length;

        // New upload means previous extraction is no longer valid.
        module.ExtractedText =
            null;

        module.UpdatedAt =
            DateTime.UtcNow;

        // ---------------------------------------------------------
        // REMOVE OLD CHUNKS
        // ---------------------------------------------------------

        var existingChunks =
            await _context.LearningModuleChunks
                .Where(x =>
                    x.LearningModuleId == moduleId)
                .ToListAsync();

        if (existingChunks.Count > 0)
        {
            _context.LearningModuleChunks
                .RemoveRange(existingChunks);
        }

        await _context.SaveChangesAsync();

        // ---------------------------------------------------------
        // RETURN UPDATED MODULE
        // ---------------------------------------------------------

        return MapModuleToDto(module);
    }

    // =========================================================
    // EXTRACT MODULE TEXT + CREATE CHUNKS
    // =========================================================

    public async Task<LearningModuleExtractionDto>
        ExtractModuleTextAsync(
            Guid moduleId)
    {
        var module =
            await _context.LearningModules
                .FirstOrDefaultAsync(x =>
                    x.Id == moduleId);

        if (module == null)
        {
            throw new KeyNotFoundException(
                "Learning module not found.");
        }

        if (string.IsNullOrWhiteSpace(
                module.FileUrl))
        {
            throw new InvalidOperationException(
                "No file has been uploaded for this module.");
        }

        if (string.IsNullOrWhiteSpace(
                module.FileName))
        {
            throw new InvalidOperationException(
                "Module file name is missing.");
        }

        // ---------------------------------------------------------
        // DOWNLOAD MODULE FILE
        // ---------------------------------------------------------

        var httpClient =
            _httpClientFactory.CreateClient();

        using var response =
            await httpClient.GetAsync(
                module.FileUrl,
                HttpCompletionOption.ResponseHeadersRead);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                "Unable to download the module file.");
        }

        const long maxFileSize =
            50 * 1024 * 1024;

        if (response.Content.Headers.ContentLength
            is long contentLength &&
            contentLength > maxFileSize)
        {
            throw new InvalidOperationException(
                "The module file exceeds the 50 MB limit.");
        }

        // ---------------------------------------------------------
        // COPY TO MEMORY
        // ---------------------------------------------------------

        await using var responseStream =
            await response.Content.ReadAsStreamAsync();

        await using var memoryStream =
            new MemoryStream();

        await responseStream.CopyToAsync(
            memoryStream);

        if (memoryStream.Length > maxFileSize)
        {
            throw new InvalidOperationException(
                "The module file exceeds the 50 MB limit.");
        }

        memoryStream.Position = 0;

        // ---------------------------------------------------------
        // EXTRACT TEXT
        // ---------------------------------------------------------

        var extraction =
            await _documentExtractor.ExtractAsync(
                memoryStream,
                module.FileName,
                module.ContentType);

        if (string.IsNullOrWhiteSpace(
                extraction.Text))
        {
            throw new InvalidOperationException(
                "No readable text was found in the module file.");
        }

        // ---------------------------------------------------------
        // SAVE EXTRACTED TEXT
        // ---------------------------------------------------------

        module.ExtractedText =
            extraction.Text;

        module.UpdatedAt =
            DateTime.UtcNow;

        // ---------------------------------------------------------
        // REMOVE OLD CHUNKS
        // ---------------------------------------------------------

        var existingChunks =
            await _context.LearningModuleChunks
                .Where(x =>
                    x.LearningModuleId == moduleId)
                .ToListAsync();

        if (existingChunks.Count > 0)
        {
            _context.LearningModuleChunks
                .RemoveRange(existingChunks);
        }

        // ---------------------------------------------------------
        // CREATE NEW CHUNKS
        // ---------------------------------------------------------

        var chunks =
            _learningModuleChunkingService
                .SplitText(
                    extraction.Text);

        var createdAt =
            DateTime.UtcNow;

        for (var index = 0;
             index < chunks.Count;
             index++)
        {
            var content =
                chunks[index];

            _context.LearningModuleChunks
                .Add(
                    new LearningModuleChunk
                    {
                        Id =
                            Guid.NewGuid(),

                        LearningModuleId =
                            module.Id,

                        ChunkNumber =
                            index + 1,

                        Content =
                            content,

                        CharacterCount =
                            content.Length,

                        CreatedAt =
                            createdAt
                    });
        }

        await _context.SaveChangesAsync();

        // ---------------------------------------------------------
        // RETURN EXTRACTION RESULT
        // ---------------------------------------------------------

        return new LearningModuleExtractionDto
        {
            LearningModuleId =
                module.Id,

            FileName =
                module.FileName,

            ContentType =
                module.ContentType,

            Text =
                extraction.Text,

            CharacterCount =
                extraction.Text.Length,

            PageCount =
                extraction.PageCount
        };
    }
}