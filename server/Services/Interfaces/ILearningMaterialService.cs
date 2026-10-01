using Microsoft.AspNetCore.Http;

using server.DTOs.Trainer.Learning;
using server.DTOs.Training.LearningMaterials;

namespace server.Services.Interfaces;

public interface ILearningMaterialService
{
    // =========================================================
    // LEARNING MATERIALS
    // =========================================================

    Task<IReadOnlyList<LearningMaterialDto>>
        GetByBatchIdAsync(
            Guid trainingBatchId);

    Task<LearningMaterialDto>
        GetByIdAsync(
            Guid id);

    Task<LearningMaterialDto>
        CreateAsync(
            Guid trainerUserId,
            CreateLearningMaterialRequest request);

    Task<LearningMaterialDto>
        UpdateAsync(
            Guid id,
            UpdateLearningMaterialRequest request);

    Task DeleteAsync(
        Guid id);

    Task<LearningMaterialDto>
        PublishAsync(
            Guid id);

    Task<LearningMaterialDto>
        UploadFileAsync(
            Guid id,
            UploadLearningMaterialRequest request);

    Task<LearningMaterialExtractionDto>
        ExtractTextAsync(
            Guid id);


    // =========================================================
    // LEARNING MODULES
    // =========================================================

    Task<LearningModuleDto>
        CreateModuleAsync(
            CreateLearningModuleRequest request);

    Task<LearningModuleDto>
        UpdateModuleAsync(
            Guid moduleId,
            UpdateLearningModuleRequest request);

    Task<IReadOnlyList<LearningModuleDto>>
        GetModulesAsync(
            Guid learningMaterialId);

    Task DeleteModuleAsync(
        Guid moduleId);


    // =========================================================
    // MODULE FILES
    // =========================================================

    // Add one or more files to a module.
    // Call this method multiple times if the module has
    // multiple source files.
    Task<LearningModuleFileDto>
        UploadModuleFileAsync(
            Guid moduleId,
            IFormFile file);

    // Extract text from ONE specific module file.
    Task<LearningModuleFileExtractionDto>
        ExtractModuleFileTextAsync(
            Guid moduleFileId);

    // Extract text from ALL files belonging to a module.
    Task<bool>
        ExtractAllModuleFilesAsync(
            Guid moduleId);


    // =========================================================
    // AI MODULE CONTENT
    // =========================================================

    Task<LearningModuleDto>
        GenerateModuleAiContentAsync(
            Guid moduleId);


    // =========================================================
    // LEARNING SECTIONS
    // =========================================================

    Task<LearningSectionDto>
        CreateSectionAsync(
            CreateLearningSectionRequest request);

    Task<LearningSectionDto>
        UpdateSectionAsync(
            Guid sectionId,
            UpdateLearningSectionRequest request);

    Task<IReadOnlyList<LearningSectionDto>>
        GetSectionsAsync(
            Guid moduleId);

    Task DeleteSectionAsync(
        Guid sectionId);
}