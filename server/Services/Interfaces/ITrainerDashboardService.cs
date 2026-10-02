using server.DTOs.TrainerDashboard;

namespace server.Services.Interfaces;

public interface ITrainerDashboardService
{
    Task<TrainerDashboardDto> GetDashboardAsync(
        Guid trainerUserId);
}