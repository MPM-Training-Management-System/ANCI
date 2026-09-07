using server.DTOs.Training.LearningMaterials;

namespace server.Services.Interfaces;

public interface ILearningProgressService
{
    Task<LearningMaterialProgressDto>
        GetMaterialProgressAsync(
            Guid participantUserId,
            Guid materialId);

    Task<LearningMaterialProgressDto>
        MarkSectionAsReadAsync(
            Guid participantUserId,
            Guid sectionId);
}