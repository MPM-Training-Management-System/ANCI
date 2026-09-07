using server.DTOs.Training.LearningMaterials;

namespace server.Services.Interfaces;

public interface ILearningMaterialService
{
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
        Task<LearningMaterialDto>
    UploadFileAsync(
        Guid id,
        UploadLearningMaterialRequest request);

        Task<LearningMaterialExtractionDto>
    ExtractTextAsync(Guid id);

    Task<IReadOnlyList<LearningModuleDto>>
    GenerateModulesFromDocumentAsync(
        Guid learningMaterialId);
}