using server.DTOs.Participant;
using server.Models;

namespace server.Services.Interfaces
{
    public interface IParticipantService
    {
        Task<ParticipantModel> RegisterAsync(
            RegisterParticipantDTO dto);

        Task<IEnumerable<ParticipantListDTO>> GetAllAsync();

        Task<ParticipantResponseDTO?> GetByIdAsync(
            Guid id);

        Task UpdateAsync(
            Guid id,
            UpdateParticipantDTO dto);

        Task DeleteAsync(
            Guid id);

        Task ChangeStatusAsync(
            Guid id,
            bool isActive);
    }
}