using server.DTOs.Training;

namespace server.Interfaces.Training;

public interface ITrainerAssignmentService
{
    Task<TrainerAssignmentDto> AssignAsync(
        Guid adminUserId,
        AssignTrainerRequest request);

    Task<IEnumerable<TrainerAssignmentDto>> GetAllAsync();

    Task<IEnumerable<TrainerAssignmentDto>> GetMyAssignmentsAsync(
        Guid trainerUserId);

    Task DeleteAsync(Guid id);
}