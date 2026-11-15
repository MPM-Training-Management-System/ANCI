using Microsoft.AspNetCore.Http;

using server.DTOs.Trainer.Learning;
using server.DTOs.Training.LearningMaterials;

namespace server.Services.Interfaces;

public interface ILearningMaterialService
{
    // =========================================================
    // LEARNING MATERIALS
    // ADMIN: Create, update, delete, upload, extract, publish
    // TRAINER: View assigned learning materials
    // PARTICIPANT: View published learning materials
    // =========================================================

    Task<IReadOnlyList<LearningMaterialDto>>
        GetByBatchIdAsync(Guid trainingBatchId);

    Task<LearningMaterialDto>
        GetByIdAsync(Guid id);

    Task<LearningMaterialDto>
        CreateAsync(CreateLearningMaterialRequest request);

    Task<LearningMaterialDto>
        UpdateAsync(
            Guid id,
            UpdateLearningMaterialRequest request);

    Task DeleteAsync(Guid id);

    Task<LearningMaterialDto>
        PublishAsync(Guid id);

    Task<LearningMaterialDto>
        UploadFileAsync(
            Guid id,
            UploadLearningMaterialRequest request);

    Task<LearningMaterialExtractionDto>
        ExtractTextAsync(Guid id);


    // =========================================================
    // LEARNING MODULES
    // TRAINER: Create, update, view, delete modules
    // =========================================================

    Task<LearningModuleDto>
        CreateModuleAsync(CreateLearningModuleRequest request);

    Task<LearningModuleDto>
        UpdateModuleAsync(
            Guid moduleId,
            UpdateLearningModuleRequest request);

    Task<IReadOnlyList<LearningModuleDto>>
        GetModulesAsync(Guid learningMaterialId);

    Task DeleteModuleAsync(Guid moduleId);


    // =========================================================
    // MODULE FILES
    // TRAINER: Upload and extract supporting files
    // =========================================================

    Task<LearningModuleFileDto>
        UploadModuleFileAsync(
            Guid moduleId,
            IFormFile file);

    Task<LearningModuleFileExtractionDto>
        ExtractModuleFileTextAsync(Guid moduleFileId);

    Task<bool>
        ExtractAllModuleFilesAsync(Guid moduleId);


    // =========================================================
    // LEARNING SECTIONS / LESSONS
    // TRAINER: Create, update, view, delete lessons
    // =========================================================

    Task<LearningSectionDto>
        CreateSectionAsync(CreateLearningSectionRequest request);

    Task<LearningSectionDto>
        UpdateSectionAsync(
            Guid sectionId,
            UpdateLearningSectionRequest request);

    Task<IReadOnlyList<LearningSectionDto>>
        GetSectionsAsync(Guid moduleId);

    Task DeleteSectionAsync(Guid sectionId);
}