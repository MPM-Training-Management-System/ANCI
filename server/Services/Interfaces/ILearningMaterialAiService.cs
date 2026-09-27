using server.DTOs.Training.LearningMaterials;

namespace server.Services.Interfaces;

public interface ILearningMaterialAiService
{
    Task<AiModuleContentResult> GenerateModuleContentAsync(
        string sourceText,
        string moduleTitle,
        string? moduleDescription,
        CancellationToken cancellationToken = default);
}