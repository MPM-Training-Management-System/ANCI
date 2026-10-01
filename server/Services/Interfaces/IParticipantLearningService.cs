using server.DTOs.Participant.Learning;

namespace server.Services.Interfaces;

public interface IParticipantLearningService
{
    Task<ParticipantLearningMaterialDto>
        GetLearningMaterialAsync(
            Guid learningMaterialId,
            Guid participantUserId);

    Task<ParticipantLearningModuleDto>
        GetModuleAsync(
            Guid moduleId,
            Guid participantUserId);

    Task<ParticipantLearningSectionDto>
        GetSectionAsync(
            Guid sectionId,
            Guid participantUserId);
}