using server.DTOs.Participant;
using server.Models;

namespace server.Services.Interfaces
{

    
    public interface IParticipantApplicationService
{
    Task<IEnumerable<ParticipantApplicationListDTO>>
        GetPendingApplicationsAsync();

    Task<ParticipantApplicationDetailsDTO?>
        GetByIdAsync(Guid id);

    Task ApproveAsync(
        Guid applicationId,
        Guid adminId);

    Task RejectAsync(
        Guid applicationId,
        Guid adminId,
        string reason);
}

    
}