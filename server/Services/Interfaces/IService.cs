using server.DTOs.Service;

namespace server.Services.Service;

public interface IService
{
    Task<List<ServiceDto>> GetAllAsync();

    Task<ServiceDto?> GetByIdAsync(Guid id);

    Task<ServiceDto> CreateAsync(CreateServiceDto dto);

    Task<ServiceDto?> UpdateAsync(
        Guid id,
        UpdateServiceDto dto
    );

    Task<bool> DeleteAsync(Guid id);

    Task<ServiceRequestDto> CreateRequestAsync(
        Guid userId,
        CreateServiceRequestDto dto
    );


    Task<List<ServiceRequestDto>> GetRequestsAsync();

Task<ServiceRequestDto?> GetRequestByIdAsync(Guid id);

Task<ServiceRequestDto?> UpdateRequestStatusAsync(
    Guid requestId,
    Guid adminUserId,
    UpdateServiceRequestStatusDto dto
);
}