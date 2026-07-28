using server.DTOs.User;

namespace server.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserResponseDTO>> GetAllAsync(
            string? search,
            string? role);

        Task<UserResponseDTO?> GetByIdAsync(Guid id);

        Task<UserResponseDTO> CreateAsync(CreateUserDTO dto);

        Task<UserResponseDTO?> UpdateAsync(
            Guid id,
            UpdateUserDTO dto);

        Task<bool> DeleteAsync(Guid id);
    }
}