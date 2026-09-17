using server.DTOs.Admin;

namespace server.Services.Interfaces;

public interface IAdminUserService
{
    Task<List<AdminUserListDto>> GetUsersAsync();

    Task<AdminUserDetailsDto?> GetUserByIdAsync(
        Guid id
    );

    Task<AdminUserDetailsDto?> UpdateUserAsync(
        Guid id,
        UpdateAdminUserRequest request
    );

    Task<AdminUserDetailsDto?> UpdateUserStatusAsync(
        Guid id,
        UpdateAdminUserStatusRequest request
    );

    Task<bool> DeleteUserAsync(
        Guid id
    );
}