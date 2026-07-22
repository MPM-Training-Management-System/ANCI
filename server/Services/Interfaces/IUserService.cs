using server.DTOs.User;

namespace server.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UserResponseDTO>> GetAllAsync(
            string? search,
            string? role);

        Task<UserResponseDTO?> GetByIdAsync(int id);

        Task<UserResponseDTO> CreateAsync(CreateUserDTO dto);

        Task<UserResponseDTO?> UpdateAsync(
            int id,
            UpdateUserDTO dto);

        Task<bool> DeleteAsync(int id);
    }
}