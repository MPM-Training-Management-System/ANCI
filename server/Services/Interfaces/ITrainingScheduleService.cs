using server.DTOs.Training.Schedule;

namespace server.Services.Interfaces;

public interface ITrainingScheduleService
{
    Task<TrainingScheduleRecommendationDto>
        GetRecommendationAsync(
            Guid trainingBatchId
        );

    Task<IReadOnlyList<TrainingSessionDto>>
        GenerateScheduleAsync(
            Guid trainingBatchId,
            GenerateTrainingScheduleRequest request
        );

    Task<IReadOnlyList<TrainingSessionDto>>
        GetScheduleAsync(
            Guid trainingBatchId
        );

          Task<IReadOnlyList<TrainingSessionDto>>
        GetParticipantScheduleAsync(
            Guid trainingBatchId,
            Guid participantUserId
        );

    Task ApproveScheduleAsync(
        Guid trainingBatchId,
        IReadOnlyList<TrainingSessionDto> sessions
    );
}