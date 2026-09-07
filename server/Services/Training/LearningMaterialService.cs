using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Training.LearningMaterials;
using server.Models.Learning;
using server.Services.DocumentExtraction;
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

    public LearningMaterialService(
        ApplicationDbContext context,
        ICloudinaryService cloudinary,
        IHttpClientFactory httpClientFactory,
        IDocumentTextExtractionService documentExtractor,
        ILearningMaterialAiService learningMaterialAiService)
    {
        _context = context;
        _cloudinary = cloudinary;
        _httpClientFactory = httpClientFactory;
        _documentExtractor = documentExtractor;
        _learningMaterialAiService = learningMaterialAiService;
    }

    // =========================================================
    // GET BY BATCH
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
    // GET BY ID
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
    // CREATE
    // =========================================================

    public async Task<LearningMaterialDto>
        CreateAsync(
            CreateLearningMaterialRequest request)
    {
        var batch =
            await _context.TrainingBatches
                .FirstOrDefaultAsync(x =>
                    x.Id ==
                    request.TrainingBatchId);

        if (batch == null)
        {
            throw new KeyNotFoundException(
                "Training batch not found.");
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

        var material =
            new LearningMaterial
            {
                Id = Guid.NewGuid(),

                TrainingBatchId =
                    request.TrainingBatchId,

                Title =
                    request.Title.Trim(),

                Description =
                    string.IsNullOrWhiteSpace(
                        request.Description)
                        ? null
                        : request.Description.Trim(),

                MaterialType =
                    request.MaterialType.Trim(),

                FileUrl = "",

                IsPublished = false,

                CreatedAt =
                    DateTime.UtcNow,

                UpdatedAt = null
            };

        await _context.LearningMaterials
            .AddAsync(material);

        await _context.SaveChangesAsync();

        await _context.Entry(material)
            .Reference(x =>
                x.TrainingBatch)
            .LoadAsync();

        return MapToDto(material);
    }

    // =========================================================
    // UPDATE
    // =========================================================

    public async Task<LearningMaterialDto>
        UpdateAsync(
            Guid id,
            UpdateLearningMaterialRequest request)
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
    // DELETE
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
    // PUBLISH
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
    // MAPPER
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
                "",

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

    // =========================================================
    // GET MODULES
    // =========================================================

    public async Task<IReadOnlyList<LearningModuleDto>>
        GetModulesAsync(
            Guid learningMaterialId)
    {
        var materialExists =
            await _context.LearningMaterials
                .AnyAsync(
                    x => x.Id == learningMaterialId);

        if (!materialExists)
        {
            throw new KeyNotFoundException(
                "Learning material not found.");
        }

        var modules =
            await _context.LearningModules
                .AsNoTracking()
                .Where(
                    x =>
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
    // UPDATE MODULE
    // =========================================================

    public async Task<LearningModuleDto>
        UpdateModuleAsync(
            Guid moduleId,
            UpdateLearningModuleRequest request)
    {
        var module =
            await _context.LearningModules
                .FirstOrDefaultAsync(
                    x => x.Id == moduleId);

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
                .AnyAsync(
                    x =>
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

        module.DisplayOrder =
            request.DisplayOrder;

        module.UpdatedAt =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

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
                .FirstOrDefaultAsync(
                    x => x.Id == moduleId);

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
        var module =
            await _context.LearningModules
                .FirstOrDefaultAsync(
                    x =>
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
                .AnyAsync(
                    x =>
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
                Id = Guid.NewGuid(),

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
                    DateTime.UtcNow
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
                .AnyAsync(
                    x => x.Id == moduleId);

        if (!moduleExists)
        {
            throw new KeyNotFoundException(
                "Learning module not found.");
        }

        var sections =
            await _context.LearningSections
                .AsNoTracking()
                .Where(
                    x =>
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
        var section =
            await _context.LearningSections
                .FirstOrDefaultAsync(
                    x => x.Id == sectionId);

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
                .AnyAsync(
                    x =>
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
                .FirstOrDefaultAsync(
                    x => x.Id == sectionId);

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
    // CREATE MODULE
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
                .AnyAsync(
                    x =>
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
                Id = Guid.NewGuid(),

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

                DisplayOrder =
                    request.DisplayOrder,

                CreatedAt =
                    DateTime.UtcNow,

                UpdatedAt = null
            };

        await _context.LearningModules
            .AddAsync(module);

        await _context.SaveChangesAsync();

        module.Sections = [];

        return MapModuleToDto(module);
    }

    // =========================================================
    // UPLOAD FILE
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
                .FirstOrDefaultAsync(
                    x => x.Id == id);

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
                ".doc",
                ".docx",
                ".ppt",
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
                "Allowed files are PDF, DOC, DOCX, PPT, and PPTX.");
        }

        // ---------------------------------------------------------
        // MAX FILE SIZE
        // 50 MB
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
        // UPDATE DATABASE
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
    // EXTRACT TEXT
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
                "No file has been uploaded for this learning material.");
        }

        if (string.IsNullOrWhiteSpace(
                material.FileName))
        {
            throw new InvalidOperationException(
                "Learning material file name is missing.");
        }

        var extension =
            Path.GetExtension(
                material.FileName)
                .ToLowerInvariant();

        if (extension != ".docx")
        {
            throw new ArgumentException(
                "Text extraction currently supports DOCX files only.");
        }

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

        var extraction =
            await _documentExtractor.ExtractAsync(
                memoryStream,
                material.FileName,
                material.ContentType);

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
// GENERATE MODULES FROM DOCUMENT
// =========================================================

public async Task<IReadOnlyList<LearningModuleDto>>
    GenerateModulesFromDocumentAsync(
        Guid learningMaterialId)
{
    var material =
        await _context.LearningMaterials
            .Include(x => x.TrainingBatch)
            .FirstOrDefaultAsync(
                x => x.Id == learningMaterialId);

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

    var extension =
        Path.GetExtension(
            material.FileName)
            .ToLowerInvariant();

    if (extension != ".docx")
    {
        throw new ArgumentException(
            "AI module generation currently supports DOCX files only.");
    }

    // =========================================================
    // DOWNLOAD DOCUMENT
    // =========================================================

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

    // =========================================================
    // EXTRACT DOCUMENT
    // =========================================================

    var extraction =
        await _documentExtractor.ExtractAsync(
            memoryStream,
            material.FileName,
            material.ContentType);

    if (string.IsNullOrWhiteSpace(
            extraction.Text))
    {
        throw new InvalidOperationException(
            "No readable text was found in the document.");
    }

    // =========================================================
    // GENERATE MODULES USING TEXT + IMAGES + VIDEO LINKS
    // =========================================================

    var aiResult =
        await _learningMaterialAiService
            .StructureLearningMaterialAsync(
                extraction.Text,
                material.Title,
                extraction.Images,
                extraction.MediaLinks);

    if (aiResult.Modules.Count == 0)
    {
        throw new InvalidOperationException(
            "AI did not generate any learning modules.");
    }

    // =========================================================
    // DELETE EXISTING MODULES / SECTIONS
    // =========================================================

    var existingModules =
        await _context.LearningModules
            .Where(x =>
                x.LearningMaterialId ==
                learningMaterialId)
            .ToListAsync();

    if (existingModules.Count > 0)
    {
        var existingModuleIds =
            existingModules
                .Select(x => x.Id)
                .ToList();

        var existingSections =
            await _context.LearningSections
                .Where(x =>
                    existingModuleIds.Contains(
                        x.LearningModuleId))
                .ToListAsync();

        if (existingSections.Count > 0)
        {
            _context.LearningSections
                .RemoveRange(
                    existingSections);
        }

        _context.LearningModules
            .RemoveRange(
                existingModules);

        await _context.SaveChangesAsync();
    }

    // =========================================================
    // CONVERT AI RESULT → DATABASE MODELS
    // =========================================================

    var modules =
        new List<LearningModule>();

    foreach (var aiModule in aiResult.Modules)
    {
        if (string.IsNullOrWhiteSpace(
                aiModule.Title))
        {
            continue;
        }

        var module =
            new LearningModule
            {
                Id = Guid.NewGuid(),

                LearningMaterialId =
                    material.Id,

                ModuleNumber =
                    aiModule.ModuleNumber > 0
                        ? aiModule.ModuleNumber
                        : modules.Count + 1,

                Title =
                    aiModule.Title.Trim(),

                Description =
                    string.IsNullOrWhiteSpace(
                        aiModule.Description)
                        ? null
                        : aiModule.Description.Trim(),

                DisplayOrder =
                    modules.Count + 1,

                CreatedAt =
                    DateTime.UtcNow,

                UpdatedAt = null,

                Sections = []
            };

        foreach (var aiSection
            in aiModule.Sections)
        {
            if (string.IsNullOrWhiteSpace(
                    aiSection.Title))
            {
                continue;
            }

            if (string.IsNullOrWhiteSpace(
                    aiSection.Content))
            {
                continue;
            }

            var contentType =
                NormalizeContentType(
                    aiSection.ContentType);

            /*
             * =====================================================
             * MEDIA VALIDATION
             * =====================================================
             *
             * Only media URLs extracted from the actual document
             * are allowed.
             */

            var mediaUrl =
                NormalizeMediaUrl(
                    aiSection.MediaUrl,
                    BuildMediaManifest(extraction));

            /*
             * If AI selected Image/Video but the media URL is not
             * one of the actual extracted assets, safely fall back
             * to Text.
             */

            if (contentType != "Text" &&
                string.IsNullOrWhiteSpace(
                    mediaUrl))
            {
                contentType = "Text";
            }

            if (contentType == "Text")
            {
                mediaUrl = null;
            }

            var section =
                new LearningSection
                {
                    Id = Guid.NewGuid(),

                    LearningModuleId =
                        module.Id,

                    SectionNumber =
                        aiSection.SectionNumber > 0
                            ? aiSection.SectionNumber
                            : module.Sections.Count + 1,

                    Title =
                        aiSection.Title.Trim(),

                    ContentType =
                        contentType,

                    Content =
                        aiSection.Content.Trim(),

                    MediaUrl =
                        mediaUrl,

                    DisplayOrder =
                        module.Sections.Count + 1,

                    CreatedAt =
                        DateTime.UtcNow,

                    UpdatedAt = null
                };

            module.Sections.Add(
                section);
        }

        if (module.Sections.Count > 0)
        {
            modules.Add(module);
        }
    }

    // =========================================================
    // VALIDATE GENERATED MODULES
    // =========================================================

    if (modules.Count == 0)
    {
        throw new InvalidOperationException(
            "AI generated modules, but no valid sections were produced.");
    }

    // =========================================================
    // SAVE MODULES + SECTIONS
    // =========================================================

    _context.LearningModules
        .AddRange(modules);

    await _context.SaveChangesAsync();

    // =========================================================
    // RETURN DTOs
    // =========================================================

    return modules
        .OrderBy(x => x.DisplayOrder)
        .Select(
            x =>
                new LearningModuleDto
                {
                    Id =
                        x.Id,

                    LearningMaterialId =
                        x.LearningMaterialId,

                    ModuleNumber =
                        x.ModuleNumber,

                    Title =
                        x.Title,

                    Description =
                        x.Description,

                    DisplayOrder =
                        x.DisplayOrder,

                    CreatedAt =
                        x.CreatedAt,

                    UpdatedAt =
                        x.UpdatedAt,

                    SectionCount =
                        x.Sections.Count
                })
        .ToList();
}
    // =========================================================
    // MEDIA MANIFEST
    // =========================================================

    private static List<MediaManifestItem>
        BuildMediaManifest(
            DocumentTextExtractionResult extraction)
    {
        var manifest =
            new List<MediaManifestItem>();

        /*
         * ---------------------------------------------------------
         * IMAGES
         * ---------------------------------------------------------
         */

        foreach (var image
                 in extraction.Images)
        {
            if (string.IsNullOrWhiteSpace(
                    image.Url))
            {
                continue;
            }

            manifest.Add(
                new MediaManifestItem
                {
                    Type = "Image",
                    Url = image.Url,
                    FileName = image.FileName,
                    Order = image.Order
                });
        }

        /*
         * ---------------------------------------------------------
         * VIDEOS
         * ---------------------------------------------------------
         */

        foreach (var media
                 in extraction.MediaLinks)
        {
            if (string.IsNullOrWhiteSpace(
                    media.Url))
            {
                continue;
            }

            manifest.Add(
                new MediaManifestItem
                {
                    Type =
                        string.IsNullOrWhiteSpace(
                            media.Type)
                            ? "Video"
                            : media.Type,

                    Url =
                        media.Url,

                    FileName = null,

                    Order =
                        media.Order
                });
        }

        return manifest
            .GroupBy(x =>
                $"{x.Type}|{x.Url}",
                StringComparer.OrdinalIgnoreCase)
            .Select(x => x.First())
            .OrderBy(x => x.Order)
            .ToList();
    }

    // =========================================================
    // BUILD AI SOURCE
    // =========================================================

    private static string
        BuildAiSource(
            string extractedText,
            IReadOnlyList<MediaManifestItem>
                mediaManifest)
    {
        if (mediaManifest.Count == 0)
        {
            return extractedText;
        }

        var builder =
            new System.Text.StringBuilder();

        builder.AppendLine(
            extractedText);

        builder.AppendLine();

        builder.AppendLine(
            "==================================================");

        builder.AppendLine(
            "AVAILABLE MEDIA ASSETS");

        builder.AppendLine(
            "==================================================");

        builder.AppendLine(
            "IMPORTANT: These are the ONLY media assets that may be used.");

        foreach (var media
                 in mediaManifest)
        {
            builder.AppendLine();

            builder.AppendLine(
                $"MEDIA TYPE: {media.Type}");

            builder.AppendLine(
                $"MEDIA ORDER: {media.Order}");

            if (!string.IsNullOrWhiteSpace(
                    media.FileName))
            {
                builder.AppendLine(
                    $"FILE NAME: {media.FileName}");
            }

            builder.AppendLine(
                $"MEDIA URL: {media.Url}");

            builder.AppendLine(
                "MEDIA URL MUST BE COPIED EXACTLY.");
        }

        return builder.ToString();
    }

    // =========================================================
    // VALIDATE AI MEDIA
    // =========================================================

    private static void ValidateAiMedia(
        AiLearningMaterialResult aiResult,
        IReadOnlyList<MediaManifestItem>
            mediaManifest)
    {
        var allowedUrls =
            mediaManifest
                .Select(x => x.Url)
                .Where(x =>
                    !string.IsNullOrWhiteSpace(x))
                .ToHashSet(
                    StringComparer.OrdinalIgnoreCase);

        foreach (var module
                 in aiResult.Modules)
        {
            foreach (var section
                     in module.Sections)
            {
                var contentType =
                    NormalizeContentType(
                        section.ContentType);

                section.ContentType =
                    contentType;

                if (contentType == "Text")
                {
                    section.MediaUrl = null;
                    continue;
                }

                if (string.IsNullOrWhiteSpace(
                        section.MediaUrl))
                {
                    /*
                     * Don't allow a media type without
                     * a valid media asset.
                     */
                    section.ContentType = "Text";
                    section.MediaUrl = null;

                    continue;
                }

                if (!allowedUrls.Contains(
                        section.MediaUrl.Trim()))
                {
                    /*
                     * Prevent AI hallucinated URLs.
                     */
                    section.ContentType = "Text";
                    section.MediaUrl = null;

                    continue;
                }

                section.MediaUrl =
                    section.MediaUrl.Trim();
            }
        }
    }

    // =========================================================
    // NORMALIZE CONTENT TYPE
    // =========================================================

    private static string
        NormalizeContentType(
            string? contentType)
    {
        if (string.IsNullOrWhiteSpace(
                contentType))
        {
            return "Text";
        }

        return contentType.Trim()
            .ToLowerInvariant() switch
        {
            "image" =>
                "Image",

            "video" =>
                "Video",

            "text" =>
                "Text",

            _ =>
                "Text"
        };
    }

    // =========================================================
    // NORMALIZE MEDIA URL
    // =========================================================

    private static string?
        NormalizeMediaUrl(
            string? mediaUrl,
            IReadOnlyList<MediaManifestItem>
                mediaManifest)
    {
        if (string.IsNullOrWhiteSpace(
                mediaUrl))
        {
            return null;
        }

        var value =
            mediaUrl.Trim();

        var match =
            mediaManifest.FirstOrDefault(
                x =>
                    x.Url.Equals(
                        value,
                        StringComparison.OrdinalIgnoreCase));

        return match?.Url;
    }

    // =========================================================
    // HEADING HELPERS
    // =========================================================

    private static bool IsHeading1(
        string style)
    {
        return style.Equals(
                   "Heading1",
                   StringComparison.OrdinalIgnoreCase)
            ||
            style.Equals(
                "Heading 1",
                StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsHeading2(
        string style)
    {
        return style.Equals(
                   "Heading2",
                   StringComparison.OrdinalIgnoreCase)
            ||
            style.Equals(
                "Heading 2",
                StringComparison.OrdinalIgnoreCase);
    }

    // =========================================================
    // APPEND SECTION CONTENT
    // =========================================================

    private static void AppendSectionContent(
        LearningSection section,
        string content)
    {
        if (string.IsNullOrWhiteSpace(
                content))
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(
                section.Content))
        {
            section.Content =
                content.Trim();

            return;
        }

        section.Content +=
            Environment.NewLine +
            Environment.NewLine +
            content.Trim();
    }

    // =========================================================
    // FORMAT TABLE
    // =========================================================

    private static string FormatTable(
        DocumentTable table)
    {
        if (table.Rows.Count == 0)
        {
            return string.Empty;
        }

        var rows =
            new List<string>();

        foreach (var row
                 in table.Rows)
        {
            if (row.Cells.Count == 0)
            {
                continue;
            }

            var cells =
                row.Cells
                    .Select(
                        cell =>
                            cell?.Trim()
                            ?? string.Empty)
                    .ToList();

            rows.Add(
                string.Join(
                    " | ",
                    cells));
        }

        return string.Join(
            Environment.NewLine,
            rows);
    }

    // =========================================================
    // MEDIA MANIFEST ITEM
    // =========================================================

    private sealed class MediaManifestItem
    {
        public string Type { get; set; } = "Image";

        public string Url { get; set; } = string.Empty;

        public string? FileName { get; set; }

        public int Order { get; set; }
    }
}