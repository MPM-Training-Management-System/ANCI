using server.DTOs.Training;

namespace server.Interfaces.Training;

public interface ITrainingProgramService
{
    Task<IEnumerable<TrainingProgramDto>> GetAllAsync();

    Task<TrainingProgramDto?> GetByIdAsync(Guid id);

    Task<TrainingProgramDto> CreateAsync(
        CreateTrainingProgramRequest request);

    Task UpdateAsync(
    Guid id,
    UpdateTrainingProgramRequest request
);

    Task DeleteAsync(Guid id);
}