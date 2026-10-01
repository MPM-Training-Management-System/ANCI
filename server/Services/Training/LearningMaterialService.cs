using System.Text.Json;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Trainer.Learning;
using server.DTOs.Training.LearningMaterials;
using server.Models.Learning;
using server.Services.DocumentExtraction;
using server.Services.Interfaces;

namespace server.Services;

public class LearningMaterialService
    : ILearningMaterialService
{
    private readonly ApplicationDbContext _context;

    private readonly ICloudinaryService _cloudinary;

    private readonly IHttpClientFactory _httpClientFactory;

    private readonly IDocumentTextExtractionService
        _documentExtractor;

    private readonly ILearningMaterialAiService
        _learningMaterialAiService;

    private readonly ILearningModuleChunkingService
        _learningModuleChunkingService;

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

        _learningMaterialAiService =
            learningMaterialAiService;

        _learningModuleChunkingService =
            learningModuleChunkingService;
    }

    // =========================================================
    // LEARNING MATERIAL
    //
    // ONE LEARNING MATERIAL PER TRAINING BATCH
    //
    // Created by:
    // ADMIN
    //
    // Used by:
    // ADMIN
    // TRAINER
    // PARTICIPANT
    // =========================================================

    public async Task<IReadOnlyList<LearningMaterialDto>>
        GetByBatchIdAsync(
            Guid trainingBatchId)
    {
        var materials =
            await _context.LearningMaterials
                .Where(x =>
                    x.TrainingBatchId ==
                    trainingBatchId)
                .OrderByDescending(x =>
                    x.CreatedAt)
                .ToListAsync();

        return materials
            .Select(
                MapLearningMaterialToDto)
            .ToList();
    }

    public async Task<LearningMaterialDto>
        GetByIdAsync(
            Guid id)
    {
        var material =
            await _context.LearningMaterials
                .FirstOrDefaultAsync(
                    x => x.Id == id);

        if (material == null)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
        }

        return MapLearningMaterialToDto(
            material);
    }

    // =========================================================
    // CREATE LEARNING MATERIAL
    //
    // ADMIN ONLY
    //
    // ONE MATERIAL PER TRAINING BATCH
    // =========================================================

    public async Task<LearningMaterialDto>
        CreateAsync(
            CreateLearningMaterialRequest request)
    {
        if (request.TrainingBatchId == Guid.Empty)
        {
            throw new ArgumentException(
                "Training batch is required.");
        }

        // -----------------------------------------------------
        // Verify training batch exists
        // -----------------------------------------------------

        var batchExists =
            await _context.TrainingBatches
                .AnyAsync(
                    x =>
                        x.Id ==
                        request.TrainingBatchId);

        if (!batchExists)
        {
            throw new KeyNotFoundException(
                "Training batch not found.");
        }

        // -----------------------------------------------------
        // ONE LEARNING MATERIAL PER TRAINING
        // -----------------------------------------------------

        var existingMaterial =
            await _context.LearningMaterials
                .AnyAsync(
                    x =>
                        x.TrainingBatchId ==
                        request.TrainingBatchId);

        if (existingMaterial)
        {
            throw new InvalidOperationException(
                "This training already has a learning material.");
        }

        // -----------------------------------------------------
        // CREATE MATERIAL
        // -----------------------------------------------------

        var material =
            new LearningMaterial
            {
                Id =
                    Guid.NewGuid(),

                TrainingBatchId =
                    request.TrainingBatchId,

                Title =
                    request.Title,

                Description =
                    request.Description,

                MaterialType =
                    request.MaterialType,

                FileUrl =
                    string.Empty,

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

                IsPublished =
                    false,

                CreatedAt =
                    DateTime.UtcNow,

                UpdatedAt =
                    null
            };

        _context.LearningMaterials.Add(
            material);

        await _context.SaveChangesAsync();

        return MapLearningMaterialToDto(
            material);
    }

    // =========================================================
    // UPDATE LEARNING MATERIAL
    //
    // ADMIN ONLY
    // =========================================================

    public async Task<LearningMaterialDto>
        UpdateAsync(
            Guid id,
            UpdateLearningMaterialRequest request)
    {
        var material =
            await _context.LearningMaterials
                .FirstOrDefaultAsync(
                    x => x.Id == id);

        if (material == null)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
        }

        material.Title =
            request.Title;

        material.Description =
            request.Description;

        material.MaterialType =
            request.MaterialType;

        material.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapLearningMaterialToDto(
            material);
    }

    // =========================================================
    // DELETE LEARNING MATERIAL
    //
    // ADMIN ONLY
    // =========================================================

    public async Task DeleteAsync(
        Guid id)
    {
        var material =
            await _context.LearningMaterials
                .FirstOrDefaultAsync(
                    x => x.Id == id);

        if (material == null)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
        }

        _context.LearningMaterials.Remove(
            material);

        await _context.SaveChangesAsync();
    }

    // =========================================================
    // PUBLISH LEARNING MATERIAL
    //
    // ADMIN ONLY
    //
    // Trainer should only see the material after
    // it has been properly prepared by Admin.
    // =========================================================

    public async Task<LearningMaterialDto>
        PublishAsync(
            Guid id)
    {
        var material =
            await _context.LearningMaterials
                .FirstOrDefaultAsync(
                    x => x.Id == id);

        if (material == null)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
        }

        if (string.IsNullOrWhiteSpace(
                material.FileUrl))
        {
            throw new InvalidOperationException(
                "The training learning material must have a source file before publishing.");
        }

        material.IsPublished =
            true;

        material.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapLearningMaterialToDto(
            material);
    }

    // =========================================================
    // UPLOAD MAIN LEARNING MATERIAL FILE
    //
    // ADMIN ONLY
    //
    // This is the ONE main source file for the training.
    // =========================================================

    public async Task<LearningMaterialDto>
        UploadFileAsync(
            Guid id,
            UploadLearningMaterialRequest request)
    {
        var material =
            await _context.LearningMaterials
                .FirstOrDefaultAsync(
                    x => x.Id == id);

        if (material == null)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
        }

        if (request.File == null ||
            request.File.Length == 0)
        {
            throw new ArgumentException(
                "A valid source file is required.");
        }

        // -----------------------------------------------------
        // Upload main source document
        // -----------------------------------------------------

        await using var stream =
            request.File.OpenReadStream();

        var uploadResult =
            await _cloudinary.UploadDocumentAsync(
                stream,
                request.File.FileName,
                "learning-materials");

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

        material.ExtractedText =
            null;

        material.IsPublished =
            false;

        material.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapLearningMaterialToDto(
            material);
    }

    // =========================================================
    // EXTRACT MAIN LEARNING MATERIAL
    //
    // ADMIN ONLY
    //
    // This extracts the source document for reference.
    // =========================================================

    public async Task<LearningMaterialExtractionDto>
        ExtractTextAsync(
            Guid id)
    {
        var material =
            await _context.LearningMaterials
                .FirstOrDefaultAsync(
                    x => x.Id == id);

        if (material == null)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
        }

        if (string.IsNullOrWhiteSpace(
                material.FileUrl))
        {
            throw new InvalidOperationException(
                "Learning material has no uploaded source file.");
        }

        var httpClient =
            _httpClientFactory.CreateClient();

        using var response =
            await httpClient.GetAsync(
                material.FileUrl,
                HttpCompletionOption.ResponseHeadersRead);

        response.EnsureSuccessStatusCode();

        await using var stream =
            await response.Content
                .ReadAsStreamAsync();

        var extractionResult =
            await _documentExtractor.ExtractAsync(
                stream,
                material.FileName ?? "document",
                material.ContentType);

        material.ExtractedText =
            extractionResult.Text;

        material.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return new LearningMaterialExtractionDto
        {
            LearningMaterialId =
                material.Id,

            FileName =
                material.FileName,

            ContentType =
                material.ContentType,

            Text =
                extractionResult.Text,

            CharacterCount =
                extractionResult.Text.Length,

            PageCount =
                extractionResult.PageCount
        };
    }

    // =========================================================
    // LEARNING MODULES
    //
    // TRAINER ONLY
    //
    // A trainer creates modules INSIDE the Admin-created
    // Learning Material.
    // =========================================================

    public async Task<LearningModuleDto>
        CreateModuleAsync(
            CreateLearningModuleRequest request)
    {
        var material =
            await _context.LearningMaterials
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        request.LearningMaterialId);

        if (material == null)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
        }

        // -----------------------------------------------------
        // Do not allow module creation before material is
        // published by Admin.
        // -----------------------------------------------------

        if (!material.IsPublished)
        {
            throw new InvalidOperationException(
                "The learning material must be published by the administrator before modules can be created.");
        }

        // -----------------------------------------------------
        // Prevent duplicate module numbers
        // -----------------------------------------------------

        var moduleNumberExists =
            await _context.LearningModules
                .AnyAsync(
                    x =>
                        x.LearningMaterialId ==
                        request.LearningMaterialId
                        &&
                        x.ModuleNumber ==
                        request.ModuleNumber);

        if (moduleNumberExists)
        {
            throw new InvalidOperationException(
                $"Module {request.ModuleNumber} already exists for this learning material.");
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
                    request.Title,

                Description =
                    request.Description,

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
                    null
            };

        _context.LearningModules.Add(
            module);

        await _context.SaveChangesAsync();

        return MapModuleToDto(
            module);
    }

    // =========================================================
    // UPDATE MODULE
    //
    // TRAINER ONLY
    // =========================================================

    public async Task<LearningModuleDto>
        UpdateModuleAsync(
            Guid moduleId,
            UpdateLearningModuleRequest request)
    {
        var module =
            await _context.LearningModules
                .Include(x => x.Files)
                .Include(x => x.Sections)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        moduleId);

        if (module == null)
        {
            throw new KeyNotFoundException(
                "Learning module not found.");
        }

        module.Title =
            request.Title;

        module.Description =
            request.Description;

        module.WelcomeContent =
            request.WelcomeContent;

        module.LearningObjectives =
            SerializeStringList(
                request.LearningObjectives);

        module.Summary =
            request.Summary;

        module.KeyTakeaways =
            SerializeStringList(
                request.KeyTakeaways);

        module.DisplayOrder =
            request.DisplayOrder;

        module.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapModuleToDto(
            module);
    }

    // =========================================================
    // GET MODULES
    //
    // Modules belong to the Learning Material.
    // =========================================================

    public async Task<IReadOnlyList<LearningModuleDto>>
        GetModulesAsync(
            Guid learningMaterialId)
    {
        var materialExists =
            await _context.LearningMaterials
                .AnyAsync(
                    x =>
                        x.Id ==
                        learningMaterialId);

        if (!materialExists)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
        }

        var modules =
            await _context.LearningModules
                .Where(
                    x =>
                        x.LearningMaterialId ==
                        learningMaterialId)
                .Include(x => x.Files)
                .Include(x => x.Sections)
                .OrderBy(
                    x => x.DisplayOrder)
                .ThenBy(
                    x => x.ModuleNumber)
                .ToListAsync();

        return modules
            .Select(
                MapModuleToDto)
            .ToList();
    }

    // =========================================================
    // DELETE MODULE
    //
    // TRAINER ONLY
    // =========================================================

    public async Task DeleteModuleAsync(
        Guid moduleId)
    {
        var module =
            await _context.LearningModules
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        moduleId);

        if (module == null)
        {
            throw new KeyNotFoundException(
                "Learning module not found.");
        }

        _context.LearningModules.Remove(
            module);

        await _context.SaveChangesAsync();
    }

    // =========================================================
    // MODULE FILES
    //
    // TRAINER ONLY
    //
    // These are files specifically used by the trainer
    // for a particular module.
    // =========================================================

    public async Task<LearningModuleFileDto>
        UploadModuleFileAsync(
            Guid moduleId,
            IFormFile file)
    {
        var moduleExists =
            await _context.LearningModules
                .AnyAsync(
                    x =>
                        x.Id ==
                        moduleId);

        if (!moduleExists)
        {
            throw new KeyNotFoundException(
                "Learning module not found.");
        }

        if (file == null ||
            file.Length == 0)
        {
            throw new ArgumentException(
                "A valid module file is required.");
        }

        await using var stream =
            file.OpenReadStream();

        var uploadResult =
            await _cloudinary.UploadDocumentAsync(
                stream,
                file.FileName,
                "learning-module-files");

        var moduleFile =
            new LearningModuleFile
            {
                Id =
                    Guid.NewGuid(),

                LearningModuleId =
                    moduleId,

                FileUrl =
                    uploadResult.Url,

                PublicId =
                    uploadResult.PublicId,

                FileName =
                    file.FileName,

                ContentType =
                    file.ContentType,

                FileSize =
                    file.Length,

                ExtractedText =
                    null,

                CreatedAt =
                    DateTime.UtcNow,

                UpdatedAt =
                    null
            };

        _context.LearningModuleFiles.Add(
            moduleFile);

        await _context.SaveChangesAsync();

        return MapModuleFileToDto(
            moduleFile);
    }

    // =========================================================
    // EXTRACT MODULE FILE
    // =========================================================

    public async Task<LearningModuleFileExtractionDto>
        ExtractModuleFileTextAsync(
            Guid moduleFileId)
    {
        var moduleFile =
            await _context.LearningModuleFiles
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        moduleFileId);

        if (moduleFile == null)
        {
            throw new KeyNotFoundException(
                "Learning module file not found.");
        }

        if (string.IsNullOrWhiteSpace(
                moduleFile.FileUrl))
        {
            throw new InvalidOperationException(
                "Module file has no uploaded file URL.");
        }

        var httpClient =
            _httpClientFactory.CreateClient();

        using var response =
            await httpClient.GetAsync(
                moduleFile.FileUrl,
                HttpCompletionOption.ResponseHeadersRead);

        response.EnsureSuccessStatusCode();

        await using var stream =
            await response.Content
                .ReadAsStreamAsync();

        var extractionResult =
            await _documentExtractor.ExtractAsync(
                stream,
                moduleFile.FileName,
                moduleFile.ContentType);

        moduleFile.ExtractedText =
            extractionResult.Text;

        moduleFile.UpdatedAt =
            DateTime.UtcNow;

        // -----------------------------------------------------
        // Replace old chunks
        // -----------------------------------------------------

        var oldChunks =
            await _context.LearningModuleChunks
                .Where(
                    x =>
                        x.LearningModuleFileId ==
                        moduleFileId)
                .ToListAsync();

        if (oldChunks.Count > 0)
        {
            _context.LearningModuleChunks
                .RemoveRange(
                    oldChunks);
        }

        var chunks =
            await _learningModuleChunkingService
                .CreateChunksAsync(
                    moduleFile.LearningModuleId,
                    moduleFile.Id,
                    extractionResult.Text);

        _context.LearningModuleChunks
            .AddRange(
                chunks);

        await _context.SaveChangesAsync();

        return new LearningModuleFileExtractionDto
        {
            LearningModuleFileId =
                moduleFile.Id,

            LearningModuleId =
                moduleFile.LearningModuleId,

            FileName =
                moduleFile.FileName,

            ContentType =
                moduleFile.ContentType,

            Text =
                extractionResult.Text,

            CharacterCount =
                extractionResult.Text.Length,

            PageCount =
                extractionResult.PageCount
        };
    }

    // =========================================================
    // EXTRACT ALL MODULE FILES
    // =========================================================

    public async Task<bool>
        ExtractAllModuleFilesAsync(
            Guid moduleId)
    {
        var moduleExists =
            await _context.LearningModules
                .AnyAsync(
                    x =>
                        x.Id ==
                        moduleId);

        if (!moduleExists)
        {
            throw new KeyNotFoundException(
                "Learning module not found.");
        }

        var fileIds =
            await _context.LearningModuleFiles
                .Where(
                    x =>
                        x.LearningModuleId ==
                        moduleId)
                .OrderBy(
                    x => x.CreatedAt)
                .Select(
                    x => x.Id)
                .ToListAsync();

        if (fileIds.Count == 0)
        {
            return false;
        }

        foreach (var fileId in fileIds)
        {
            await ExtractModuleFileTextAsync(
                fileId);
        }

        return true;
    }

    // =========================================================
    // AI MODULE CONTENT
    //
    // TRAINER ONLY
    //
    // AI generates LESSON CONTENT for an existing module.
    //
    // AI does NOT create modules.
    // AI does NOT create assessments.
    // =========================================================

    public async Task<LearningModuleDto>
        GenerateModuleAiContentAsync(
            Guid moduleId)
    {
        var module =
            await _context.LearningModules
                .Include(x => x.Files)
                .Include(x => x.Sections)
                .Include(x => x.LearningMaterial)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        moduleId);

        if (module == null)
        {
            throw new KeyNotFoundException(
                "Learning module not found.");
        }

        if (module.Sections.Count > 0)
        {
            throw new InvalidOperationException(
                "This module already has sections. " +
                "AI generation cannot replace existing sections.");
        }

        // -----------------------------------------------------
        // SOURCE TEXT
        //
        // PRIORITY:
        //
        // 1. Trainer module files
        // 2. Admin learning material source
        // -----------------------------------------------------

        var sources =
            module.Files
                .Where(
                    x =>
                        !string.IsNullOrWhiteSpace(
                            x.ExtractedText))
                .OrderBy(
                    x => x.CreatedAt)
                .Select(
                    x => x.ExtractedText!)
                .ToList();

        string sourceText;

        if (sources.Count > 0)
        {
            sourceText =
                string.Join(
                    "\n\n====================\n\n",
                    sources);
        }
        else if (
            !string.IsNullOrWhiteSpace(
                module.LearningMaterial.ExtractedText))
        {
            sourceText =
                module.LearningMaterial.ExtractedText;
        }
        else
        {
            throw new InvalidOperationException(
                "No extracted source content was found for this module.");
        }

        // -----------------------------------------------------
        // RE-EXTRACT MODULE FILE MEDIA
        // -----------------------------------------------------

        var extractedMediaResults =
            new List<DocumentTextExtractionResult>();

        foreach (
            var moduleFile in
            module.Files
                .OrderBy(x => x.CreatedAt))
        {
            if (string.IsNullOrWhiteSpace(
                    moduleFile.FileUrl))
            {
                continue;
            }

            var httpClient =
                _httpClientFactory.CreateClient();

            using var response =
                await httpClient.GetAsync(
                    moduleFile.FileUrl,
                    HttpCompletionOption.ResponseHeadersRead);

            response.EnsureSuccessStatusCode();

            await using var stream =
                await response.Content
                    .ReadAsStreamAsync();

            var extractionResult =
                await _documentExtractor.ExtractAsync(
                    stream,
                    moduleFile.FileName,
                    moduleFile.ContentType);

            extractedMediaResults.Add(
                extractionResult);
        }

        // -----------------------------------------------------
        // IMAGES
        // -----------------------------------------------------

        var images =
            extractedMediaResults
                .SelectMany(
                    x => x.Images)
                .Where(
                    x =>
                        !string.IsNullOrWhiteSpace(
                            x.Url))
                .GroupBy(
                    x => x.Url,
                    StringComparer.OrdinalIgnoreCase)
                .Select(
                    x => x.First())
                .ToList();

        // -----------------------------------------------------
        // MEDIA LINKS
        // -----------------------------------------------------

        var mediaLinks =
            extractedMediaResults
                .SelectMany(
                    x => x.MediaLinks)
                .Where(
                    x =>
                        !string.IsNullOrWhiteSpace(
                            x.Url))
                .GroupBy(
                    x => x.Url,
                    StringComparer.OrdinalIgnoreCase)
                .Select(
                    x => x.First())
                .ToList();

        // -----------------------------------------------------
        // AI GENERATION
        // -----------------------------------------------------

        AiModuleContentResult aiResult;

        try
        {
            aiResult =
                await _learningMaterialAiService
                    .GenerateModuleContentAsync(
                        sourceText,
                        module.Title,
                        module.Description,
                        images,
                        mediaLinks);
        }
        finally
        {
            CleanupTemporaryImages(
                images);
        }

        // -----------------------------------------------------
        // SAVE MODULE CONTENT
        // -----------------------------------------------------

        module.WelcomeContent =
            aiResult.Welcome;

        module.LearningObjectives =
            SerializeStringList(
                aiResult.LearningObjectives);

        module.Summary =
            aiResult.Summary;

        module.KeyTakeaways =
            SerializeStringList(
                aiResult.KeyTakeaways);

        // -----------------------------------------------------
        // CREATE LESSONS / SECTIONS
        // -----------------------------------------------------

        foreach (
            var aiSection in
            aiResult.Sections)
        {
            var primaryMediaUrl =
                ResolvePrimaryMediaUrl(
                    aiSection.Media,
                    images,
                    mediaLinks);

            var section =
                new LearningSection
                {
                    Id =
                        Guid.NewGuid(),

                    LearningModuleId =
                        module.Id,

                    SectionNumber =
                        aiSection.SectionNumber,

                    Title =
                        aiSection.Title,

                    ContentType =
                        aiSection.ContentType,

                    Content =
                        aiSection.Content,

                    MediaUrl =
                        primaryMediaUrl,

                    DisplayOrder =
                        aiSection.SectionNumber,

                    CreatedAt =
                        DateTime.UtcNow,

                    UpdatedAt =
                        null
                };

            _context.LearningSections.Add(
                section);
        }

        module.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        await _context.Entry(module)
            .Collection(
                x => x.Sections)
            .LoadAsync();

        return MapModuleToDto(
            module);
    }

    // =========================================================
    // LEARNING SECTIONS / LESSONS
    //
    // TRAINER CREATES THE LESSONS
    // =========================================================

    public async Task<LearningSectionDto>
        CreateSectionAsync(
            CreateLearningSectionRequest request)
    {
        var moduleExists =
            await _context.LearningModules
                .AnyAsync(
                    x =>
                        x.Id ==
                        request.LearningModuleId);

        if (!moduleExists)
        {
            throw new KeyNotFoundException(
                "Learning module not found.");
        }

        // -----------------------------------------------------
        // Validate YouTube video
        // -----------------------------------------------------

        if (
            string.Equals(
                request.ContentType,
                "Video",
                StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(
                    request.MediaUrl))
            {
                throw new ArgumentException(
                    "A YouTube video URL is required for video lessons.");
            }

            if (!IsYouTubeUrl(
                    request.MediaUrl))
            {
                throw new ArgumentException(
                    "Only valid YouTube URLs are allowed for video lessons.");
            }
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
                    request.Title,

                ContentType =
                    request.ContentType,

                Content =
                    request.Content,

                MediaUrl =
                    request.MediaUrl,

                DisplayOrder =
                    request.DisplayOrder,

                CreatedAt =
                    DateTime.UtcNow,

                UpdatedAt =
                    null
            };

        _context.LearningSections.Add(
            section);

        await _context.SaveChangesAsync();

        return MapSectionToDto(
            section);
    }

    // =========================================================
    // UPDATE LESSON
    // =========================================================

    public async Task<LearningSectionDto>
        UpdateSectionAsync(
            Guid sectionId,
            UpdateLearningSectionRequest request)
    {
        var section =
            await _context.LearningSections
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        sectionId);

        if (section == null)
        {
            throw new KeyNotFoundException(
                "Learning lesson not found.");
        }

        if (
            string.Equals(
                request.ContentType,
                "Video",
                StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(
                    request.MediaUrl))
            {
                throw new ArgumentException(
                    "A YouTube video URL is required for video lessons.");
            }

            if (!IsYouTubeUrl(
                    request.MediaUrl))
            {
                throw new ArgumentException(
                    "Only valid YouTube URLs are allowed for video lessons.");
            }
        }

        section.SectionNumber =
            request.SectionNumber;

        section.Title =
            request.Title;

        section.ContentType =
            request.ContentType;

        section.Content =
            request.Content;

        section.MediaUrl =
            request.MediaUrl;

        section.DisplayOrder =
            request.DisplayOrder;

        section.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapSectionToDto(
            section);
    }

    // =========================================================
    // GET LESSONS
    // =========================================================

    public async Task<IReadOnlyList<LearningSectionDto>>
        GetSectionsAsync(
            Guid moduleId)
    {
        var moduleExists =
            await _context.LearningModules
                .AnyAsync(
                    x =>
                        x.Id ==
                        moduleId);

        if (!moduleExists)
        {
            throw new KeyNotFoundException(
                "Learning module not found.");
        }

        var sections =
            await _context.LearningSections
                .Where(
                    x =>
                        x.LearningModuleId ==
                        moduleId)
                .OrderBy(
                    x => x.DisplayOrder)
                .ThenBy(
                    x => x.SectionNumber)
                .ToListAsync();

        return sections
            .Select(
                MapSectionToDto)
            .ToList();
    }

    // =========================================================
    // DELETE LESSON
    // =========================================================

    public async Task DeleteSectionAsync(
        Guid sectionId)
    {
        var section =
            await _context.LearningSections
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        sectionId);

        if (section == null)
        {
            throw new KeyNotFoundException(
                "Learning lesson not found.");
        }

        _context.LearningSections.Remove(
            section);

        await _context.SaveChangesAsync();
    }

    // =========================================================
    // YOUTUBE VALIDATION
    // =========================================================

    private static bool
        IsYouTubeUrl(
            string url)
    {
        if (!Uri.TryCreate(
                url,
                UriKind.Absolute,
                out var uri))
        {
            return false;
        }

        var host =
            uri.Host.ToLowerInvariant();

        return host == "youtube.com"
            || host == "www.youtube.com"
            || host == "m.youtube.com"
            || host == "youtu.be"
            || host == "www.youtu.be";
    }

    // =========================================================
    // AI MEDIA HELPERS
    // =========================================================

    private static string?
        ResolvePrimaryMediaUrl(
            IReadOnlyList<AiSectionMediaResult>? media,
            IReadOnlyList<DocumentImage> images,
            IReadOnlyList<DocumentMediaLink> mediaLinks)
    {
        if (media == null ||
            media.Count == 0)
        {
            return null;
        }

        foreach (var item in media)
        {
            if (string.Equals(
                    item.Type,
                    "Image",
                    StringComparison.OrdinalIgnoreCase))
            {
                if (item.SourceIndex > 0)
                {
                    var imageIndex =
                        item.SourceIndex - 1;

                    if (imageIndex >= 0 &&
                        imageIndex < images.Count)
                    {
                        var image =
                            images[imageIndex];

                        if (!string.IsNullOrWhiteSpace(
                                image.Url))
                        {
                            return image.Url.Trim();
                        }
                    }
                }

                if (!string.IsNullOrWhiteSpace(
                        item.Url))
                {
                    var matchingImage =
                        images.FirstOrDefault(
                            image =>
                                !string.IsNullOrWhiteSpace(
                                    image.Url)
                                &&
                                string.Equals(
                                    image.Url.Trim(),
                                    item.Url.Trim(),
                                    StringComparison.OrdinalIgnoreCase));

                    if (matchingImage != null)
                    {
                        return matchingImage.Url.Trim();
                    }
                }
            }

            if (string.Equals(
                    item.Type,
                    "Video",
                    StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrWhiteSpace(
                        item.Url))
                {
                    continue;
                }

                var matchingVideo =
                    mediaLinks.FirstOrDefault(
                        link =>
                            !string.IsNullOrWhiteSpace(
                                link.Url)
                            &&
                            string.Equals(
                                link.Url.Trim(),
                                item.Url.Trim(),
                                StringComparison.OrdinalIgnoreCase));

                if (matchingVideo != null)
                {
                    return matchingVideo.Url.Trim();
                }

                if (IsYouTubeUrl(item.Url))
                {
                    return item.Url.Trim();
                }
            }
        }

        return null;
    }

    private static void
        CleanupTemporaryImages(
            IReadOnlyList<DocumentImage> images)
    {
        foreach (var image in images)
        {
            if (string.IsNullOrWhiteSpace(
                    image.LocalPath))
            {
                continue;
            }

            try
            {
                if (File.Exists(
                        image.LocalPath))
                {
                    File.Delete(
                        image.LocalPath);
                }
            }
            catch
            {
                // Temporary image cleanup should
                // not break AI generation.
            }
        }
    }

    // =========================================================
    // MAPPERS
    // =========================================================

    private LearningMaterialDto
        MapLearningMaterialToDto(
            LearningMaterial material)
    {
        return new LearningMaterialDto
        {
            Id =
                material.Id,

            TrainingBatchId =
                material.TrainingBatchId,

            Title =
                material.Title,

            Description =
                material.Description,

            MaterialType =
                material.MaterialType,

            FileUrl =
                material.FileUrl,

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

    private LearningModuleDto
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

            Files =
                module.Files?
                    .OrderBy(
                        x => x.CreatedAt)
                    .Select(
                        MapModuleFileToDto)
                    .ToList()
                ?? [],

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

    private LearningModuleFileDto
        MapModuleFileToDto(
            LearningModuleFile file)
    {
        return new LearningModuleFileDto
        {
            Id =
                file.Id,

            LearningModuleId =
                file.LearningModuleId,

            FileUrl =
                file.FileUrl,

            FileName =
                file.FileName,

            ContentType =
                file.ContentType,

            FileSize =
                file.FileSize,

            ExtractedText =
                file.ExtractedText,

            CreatedAt =
                file.CreatedAt,

            UpdatedAt =
                file.UpdatedAt
        };
    }

    private LearningSectionDto
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
    // JSON HELPERS
    // =========================================================

    private static List<string>
        DeserializeStringList(
            string? json)
    {
        if (string.IsNullOrWhiteSpace(
                json))
        {
            return [];
        }

        try
        {
            return JsonSerializer
                .Deserialize<List<string>>(
                    json)
                ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }

    private static string?
        SerializeStringList(
            List<string>? values)
    {
        if (values == null ||
            values.Count == 0)
        {
            return null;
        }

        return JsonSerializer.Serialize(
            values);
    }
}