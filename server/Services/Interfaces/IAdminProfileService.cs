using server.DTOs.Admin;

namespace server.Services.Interfaces;

public interface IAdminProfileService
{
    Task<AdminProfileDto?> GetMyProfileAsync(
        Guid userId
    );
}