using server.DTOs.TrainingSchedule;

namespace server.Services.Interfaces
{
    public interface ITrainingScheduleService
    {
        Task<IEnumerable<TrainingScheduleResponseDto>> GetAllAsync();

        Task<TrainingScheduleResponseDto?> GetByIdAsync(Guid id);

        Task<TrainingScheduleResponseDto> CreateAsync(CreateTrainingScheduleDto dto);

        Task<TrainingScheduleResponseDto?> UpdateAsync(Guid id, UpdateTrainingScheduleDto dto);

        Task<bool> DeleteAsync(Guid id);
    }
}