using server.DTOs.Training;

namespace server.Interfaces.Training;

public interface ITrainingBatchService
{
    Task<IEnumerable<TrainingBatchDto>> GetAllAsync();

    Task<TrainingBatchDto?> GetByIdAsync(Guid id);

    Task<TrainingBatchDto> CreateAsync(
        CreateTrainingBatchRequest request);

    Task UpdateAsync(
        Guid id,
        CreateTrainingBatchRequest request);

    Task UpdateStatusAsync(
        Guid id,
        string status);
    
         Task DeleteAsync(
        Guid id
    );
    Task<IEnumerable<TrainingProgramRequirementDto>>
    GetRequirementsAsync(Guid trainingBatchId);
}