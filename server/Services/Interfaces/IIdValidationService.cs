using server.DTOs;
namespace server.Services.Interfaces
{
    public interface IIdValidationService
    {
        Task<IdValidationResponseDTO> ValidateAsync(
            Guid userId,
            IFormFile file,
            string idType
        );
    }
}