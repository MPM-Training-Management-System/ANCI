using server.DTOs.Participant;

namespace server.Services.Interfaces;

public interface IParticipantService
{
    Task RegisterAsync(RegisterParticipantDTO dto);

    Task<List<ParticipantListDTO>> GetAllAsync();

    Task<ParticipantResponseDTO?> GetByIdAsync(Guid id);

    Task UpdateAsync(Guid id, UpdateParticipantDTO dto);

    Task DeleteAsync(Guid id);

    Task ChangeStatusAsync(Guid id, bool isActive);
}