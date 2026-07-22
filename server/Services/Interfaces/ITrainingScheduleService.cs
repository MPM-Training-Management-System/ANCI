using server.DTOs.TrainingSchedule;

namespace server.Services.Interfaces
{
    public interface ITrainingScheduleService
    {
        Task<IEnumerable<TrainingScheduleResponseDto>> GetAllAsync();

        Task<TrainingScheduleResponseDto?> GetByIdAsync(int id);

        Task<TrainingScheduleResponseDto> CreateAsync(CreateTrainingScheduleDto dto);

        Task<TrainingScheduleResponseDto?> UpdateAsync(int id, UpdateTrainingScheduleDto dto);

        Task<bool> DeleteAsync(int id);
    }
}