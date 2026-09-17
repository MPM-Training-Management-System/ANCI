using server.DTOs.Service;

namespace server.Services.Service;

public interface IServiceConsultationService
{
    Task<ServiceConsultationDto?> CreateAsync(
        Guid adminUserId,
        CreateServiceConsultationDto dto
    );

    Task<List<ServiceConsultationDto>> GetAllAsync();

    Task<ServiceConsultationDto?> GetByIdAsync(
        Guid id
    );

    Task<ServiceConsultationDto?> UpdateAsync(
        Guid id,
        UpdateServiceConsultationDto dto
    );
}