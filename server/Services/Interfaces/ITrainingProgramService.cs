using server.DTOs.TrainingProgram;

namespace server.Services.Interfaces
{
    public interface ITrainingProgramService
    {
        Task<IEnumerable<TrainingProgramResponseDto>> GetAllAsync();

        Task<TrainingProgramResponseDto?> GetByIdAsync(int id);

        Task<TrainingProgramResponseDto> CreateAsync(CreateTrainingProgramDto dto);

        Task<TrainingProgramResponseDto?> UpdateAsync(int id, UpdateTrainingProgramDto dto);

        Task<bool> DeleteAsync(int id);
    }
}