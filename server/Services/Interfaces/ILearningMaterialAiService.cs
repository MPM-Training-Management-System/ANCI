using server.DTOs.Training.LearningMaterials;
using server.Services.DocumentExtraction;

namespace server.Services.Interfaces;

public interface ILearningMaterialAiService
{
    Task<AiLearningMaterialResult> StructureLearningMaterialAsync(
        string rawText,
        string materialTitle,
        CancellationToken cancellationToken = default);

    Task<AiLearningMaterialResult> StructureLearningMaterialAsync(
        string rawText,
        string materialTitle,
        IReadOnlyList<DocumentImage> images,
        IReadOnlyList<DocumentMediaLink> mediaLinks,
        CancellationToken cancellationToken = default);
}