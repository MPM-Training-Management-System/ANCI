using Microsoft.AspNetCore.Http;

using server.DTOs.Trainer.Learning;
using server.DTOs.Training.LearningMaterials;

namespace server.Services.Interfaces;

public interface ILearningMaterialService
{
    // =========================================================
    // LEARNING MATERIALS
    //
    // ADMIN:
    // - Create
    // - Update
    // - Delete
    // - Upload main source file
    // - Extract source file
    // - Publish
    //
    // TRAINER:
    // - View assigned learning material
    //
    // PARTICIPANT:
    // - View published learning material
    // =========================================================

    Task<IReadOnlyList<LearningMaterialDto>>
        GetByBatchIdAsync(
            Guid trainingBatchId);

    Task<LearningMaterialDto>
        GetByIdAsync(
            Guid id);

    Task<LearningMaterialDto>
        CreateAsync(
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
    //
    // TRAINER CREATES MODULES
    // INSIDE THE ADMIN-CREATED LEARNING MATERIAL
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
    //
    // TRAINER CAN ADD SUPPORTING FILES
    // TO A SPECIFIC MODULE
    // =========================================================

    Task<LearningModuleFileDto>
        UploadModuleFileAsync(
            Guid moduleId,
            IFormFile file);

    Task<LearningModuleFileExtractionDto>
        ExtractModuleFileTextAsync(
            Guid moduleFileId);

    Task<bool>
        ExtractAllModuleFilesAsync(
            Guid moduleId);


    // =========================================================
    // AI MODULE CONTENT
    //
    // TRAINER USES AI TO GENERATE LESSON CONTENT
    // INSIDE AN EXISTING MODULE
    // =========================================================

    Task<LearningModuleDto>
        GenerateModuleAiContentAsync(
            Guid moduleId);


    // =========================================================
    // LEARNING SECTIONS / LESSONS
    //
    // TRAINER CREATES LESSONS
    // INSIDE A MODULE
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