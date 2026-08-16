using server.DTOs.User;

namespace server.Services.Interfaces
{
    public interface IUserApplicationService
    {
        // ==========================================
        // GET PENDING
        // ==========================================

        Task<IEnumerable<UserApplicationResponseDTO>>
            GetPendingApplicationsAsync();

        // ==========================================
        // GET DETAILS
        // ==========================================

        Task<UserApplicationDetailsDTO?>
            GetByIdAsync(Guid id);

        // ==========================================
        // APPROVE
        // ==========================================

        Task ApproveAsync(
            Guid applicationId,
            Guid adminId);

        // ==========================================
        // REJECT
        // ==========================================

        Task RejectAsync(
            Guid applicationId,
            Guid adminId,
            string reason);
    }
}