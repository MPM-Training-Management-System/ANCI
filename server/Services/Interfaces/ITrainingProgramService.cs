using server.DTOs.TrainingProgram;

namespace server.Services.Interfaces
{
    public interface ITrainingProgramService
    {
        Task<IEnumerable<TrainingProgramResponseDto>> GetAllAsync();

        Task<TrainingProgramResponseDto?> GetByIdAsync(Guid id);

        Task<TrainingProgramResponseDto> CreateAsync(CreateTrainingProgramDto dto);

        Task<TrainingProgramResponseDto?> UpdateAsync(Guid id, UpdateTrainingProgramDto dto);

        Task<bool> DeleteAsync(Guid id);
    }
}