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
    // LEARNING MATERIALS
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

    public async Task<LearningMaterialDto>
        CreateAsync(
            Guid trainerUserId,
            CreateLearningMaterialRequest request)
    {
        var material =
            new LearningMaterial
            {
                Id = Guid.NewGuid(),

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
                "Learning material must have an uploaded file before publishing.");
        }

        material.IsPublished =
            true;

        material.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapLearningMaterialToDto(
            material);
    }

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
                "A valid file is required.");
        }

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
                "Learning material has no uploaded file.");
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
    // =========================================================

    public async Task<LearningModuleDto>
        CreateModuleAsync(
            CreateLearningModuleRequest request)
    {
        var materialExists =
            await _context.LearningMaterials
                .AnyAsync(
                    x =>
                        x.Id ==
                        request.LearningMaterialId);

        if (!materialExists)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
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
                    x => x.Id == moduleId);

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

    public async Task<IReadOnlyList<LearningModuleDto>>
        GetModulesAsync(
            Guid learningMaterialId)
    {
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
                "A valid file is required.");
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

        // =====================================================
        // COLLECT SOURCE TEXT
        // =====================================================

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

        // =====================================================
        // RE-EXTRACT MODULE FILES FOR MEDIA
        // =====================================================

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

        // =====================================================
        // COMBINE IMAGES
        // =====================================================

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

        // =====================================================
        // COMBINE MEDIA LINKS
        // =====================================================

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

        // =====================================================
        // DEBUG INFORMATION
        // =====================================================

        Console.WriteLine(
            "================ AI MEDIA DEBUG ================");

        Console.WriteLine(
            $"Module: {module.Title}");

        Console.WriteLine(
            $"Embedded images found: {images.Count}");

        for (var index = 0; index < images.Count; index++)
        {
            var image = images[index];

            Console.WriteLine(
                $"IMAGE {index + 1}:");

            Console.WriteLine(
                $"IMAGE URL: {image.Url}");

            Console.WriteLine(
                $"LOCAL PATH: {image.LocalPath}");
        }

        Console.WriteLine(
            $"Media links found: {mediaLinks.Count}");

        foreach (var mediaLink in mediaLinks)
        {
            Console.WriteLine(
                $"MEDIA URL: {mediaLink.Url}");
        }

        Console.WriteLine(
            "=================================================");

        // =====================================================
        // AI GENERATION
        // =====================================================

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
            // =================================================
            // CLEAN TEMPORARY IMAGE FILES
            // =================================================

            CleanupTemporaryImages(
                images);
        }

        // =====================================================
        // SAVE MODULE AI CONTENT
        // =====================================================

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

        // =====================================================
        // CREATE AI SECTIONS
        // =====================================================

        foreach (
            var aiSection in
            aiResult.Sections)
        {
            // -------------------------------------------------
            // RESOLVE PRIMARY MEDIA
            // -------------------------------------------------
            //
            // AI now returns sourceIndex for embedded images.
            //
            // Example:
            //
            // sourceIndex = 1
            //
            // means:
            //
            // images[0].Url
            //
            // which is the real Cloudinary URL.
            // -------------------------------------------------

            var primaryMediaUrl =
                ResolvePrimaryMediaUrl(
                    aiSection.Media,
                    images,
                    mediaLinks);

            // -------------------------------------------------
            // CREATE LearningSection MODEL
            // -------------------------------------------------

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

            // -------------------------------------------------
            // ADD MODEL TO EF CORE
            // -------------------------------------------------

            _context.LearningSections.Add(
                section);

            // -------------------------------------------------
            // DEBUG
            // -------------------------------------------------

            Console.WriteLine(
                "================ SECTION MEDIA DEBUG ================");

            Console.WriteLine(
                $"Section: {section.Title}");

            Console.WriteLine(
                $"Section Number: {section.SectionNumber}");

            Console.WriteLine(
                $"AI Media Count: {aiSection.Media?.Count ?? 0}");

            if (aiSection.Media != null)
            {
                foreach (var media in aiSection.Media)
                {
                    Console.WriteLine(
                        $"AI Media Type: {media.Type}");

                    Console.WriteLine(
                        $"AI SourceIndex: {media.SourceIndex}");

                    Console.WriteLine(
                        $"AI URL: {media.Url}");
                }
            }

            Console.WriteLine(
                $"Resolved MediaUrl: {section.MediaUrl ?? "NULL"}");

            Console.WriteLine(
                "======================================================");
        }

        // =====================================================
        // UPDATE MODULE
        // =====================================================

        module.UpdatedAt =
            DateTime.UtcNow;

        // =====================================================
        // SAVE EVERYTHING TO DATABASE
        // =====================================================

        await _context.SaveChangesAsync();

        // =====================================================
        // RELOAD SECTIONS
        // =====================================================

        await _context.Entry(module)
            .Collection(
                x => x.Sections)
            .LoadAsync();

        return MapModuleToDto(
            module);
    }


    // =========================================================
    // LEARNING SECTIONS
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
                "Learning section not found.");
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

    public async Task<IReadOnlyList<LearningSectionDto>>
        GetSectionsAsync(
            Guid moduleId)
    {
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
                "Learning section not found.");
        }

        _context.LearningSections.Remove(
            section);

        await _context.SaveChangesAsync();
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
            // =================================================
            // IMAGE
            // =================================================

            if (string.Equals(
                    item.Type,
                    "Image",
                    StringComparison.OrdinalIgnoreCase))
            {
                // ---------------------------------------------
                // NEW METHOD:
                //
                // AI gives sourceIndex.
                //
                // sourceIndex 1 -> images[0]
                // sourceIndex 2 -> images[1]
                // ---------------------------------------------

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

                // ---------------------------------------------
                // FALLBACK:
                //
                // If AI returned a URL directly, try to match
                // it against our extracted images.
                // ---------------------------------------------

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

            // =================================================
            // VIDEO
            // =================================================

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
            }
        }

        return null;
    }

    // =========================================================
    // VERIFY MEDIA URL
    // =========================================================

    private static bool
        IsAllowedMediaUrl(
            string mediaUrl,
            IReadOnlyList<DocumentImage> images,
            IReadOnlyList<DocumentMediaLink> mediaLinks)
    {
        if (string.IsNullOrWhiteSpace(
                mediaUrl))
        {
            return false;
        }

        var normalizedUrl =
            mediaUrl.Trim();

        var imageMatch =
            images.Any(
                image =>
                    !string.IsNullOrWhiteSpace(
                        image.Url)
                    &&
                    string.Equals(
                        image.Url.Trim(),
                        normalizedUrl,
                        StringComparison.OrdinalIgnoreCase));

        if (imageMatch)
        {
            return true;
        }

        var mediaLinkMatch =
            mediaLinks.Any(
                mediaLink =>
                    !string.IsNullOrWhiteSpace(
                        mediaLink.Url)
                    &&
                    string.Equals(
                        mediaLink.Url.Trim(),
                        normalizedUrl,
                        StringComparison.OrdinalIgnoreCase));

        return mediaLinkMatch;
    }

    // =========================================================
    // CLEAN TEMPORARY IMAGES
    // =========================================================

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
                // Temporary-file cleanup failure
                // must not break AI generation.
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