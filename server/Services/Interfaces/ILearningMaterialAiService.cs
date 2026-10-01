using server.DTOs.Training.LearningMaterials;
using server.Services.DocumentExtraction;

namespace server.Services.Interfaces;

public interface ILearningMaterialAiService
{
    Task<AiModuleContentResult>
        GenerateModuleContentAsync(
            string sourceText,
            string moduleTitle,
            string? moduleDescription,
            IReadOnlyList<DocumentImage> images,
            IReadOnlyList<DocumentMediaLink> mediaLinks,
            CancellationToken cancellationToken = default);
}