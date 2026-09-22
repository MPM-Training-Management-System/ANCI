using server.DTOs.Training;

namespace server.Services.Training;

public interface IParticipationService
{
    Task<ParticipationSettingDto> GetSettingAsync(Guid trainingBatchId);

    Task<ParticipationSettingDto> SaveSettingAsync(
        Guid trainingBatchId,
        int requiredRecitations);

    Task<ParticipationRecordDto> RecordRecitationAsync(
        Guid enrollmentId,
        Guid trainingSessionId,
        Guid recordedByUserId,
        string? remarks = null);

    Task RemoveRecitationAsync(Guid id);

    Task<List<ParticipationParticipantDto>> GetSessionParticipantsAsync(
        Guid trainingSessionId);

    Task<ParticipationProgressDto> GetParticipantProgressAsync(
        Guid enrollmentId);
}