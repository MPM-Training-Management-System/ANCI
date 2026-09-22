using server.DTOs.Training;

namespace server.Services.Training;

public interface ITrainingGradeService
{
    Task<TrainingGradeDto?> GetByEnrollmentAsync(Guid enrollmentId);

     Task<IReadOnlyList<TrainingGradeDto>> GetAllAsync();
}
