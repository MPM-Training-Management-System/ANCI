using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Service;
using server.Enums;
using server.Models.Service;

namespace server.Services.Service;

public class ServiceService : IService
{
    private readonly ApplicationDbContext _context;

    public ServiceService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ServiceDto>> GetAllAsync()
    {
        return await _context.Services
            .AsNoTracking()
            .Include(x => x.Requirements)
            .OrderBy(x => x.Name)
            .Select(x => new ServiceDto
            {
                Id = x.Id,
                ServiceCode = x.ServiceCode,
                Name = x.Name,
                Description = x.Description,
                Category = x.Category,
                RequiresTraining = x.RequiresTraining,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt,

                Requirements = x.Requirements
                    .OrderBy(r => r.DisplayOrder)
                    .Select(r => new ServiceRequirementDto
                    {
                        Id = r.Id,
                        Name = r.Name,
                        Description = r.Description,
                        IsRequired = r.IsRequired,
                        DisplayOrder = r.DisplayOrder
                    })
                    .ToList()
            })
            .ToListAsync();
    }

    public async Task<ServiceDto?> GetByIdAsync(Guid id)
    {
        return await _context.Services
            .AsNoTracking()
            .Include(x => x.Requirements)
            .Where(x => x.Id == id)
            .Select(x => new ServiceDto
            {
                Id = x.Id,
                ServiceCode = x.ServiceCode,
                Name = x.Name,
                Description = x.Description,
                Category = x.Category,
                RequiresTraining = x.RequiresTraining,
                IsActive = x.IsActive,
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt,

                Requirements = x.Requirements
                    .OrderBy(r => r.DisplayOrder)
                    .Select(r => new ServiceRequirementDto
                    {
                        Id = r.Id,
                        Name = r.Name,
                        Description = r.Description,
                        IsRequired = r.IsRequired,
                        DisplayOrder = r.DisplayOrder
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync();
    }

    public async Task<ServiceDto> CreateAsync(CreateServiceDto dto)
    {
        var serviceCode = dto.ServiceCode.Trim().ToUpper();

        var exists = await _context.Services
            .AnyAsync(x => x.ServiceCode == serviceCode);

        if (exists)
        {
            throw new InvalidOperationException(
                "A service with this service code already exists."
            );
        }

        var now = DateTime.UtcNow;

        var service = new Models.Service.Service
        {
            Id = Guid.NewGuid(),
            ServiceCode = serviceCode,
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            Category = dto.Category.Trim(),
            RequiresTraining = dto.RequiresTraining,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };

        foreach (var requirementDto in dto.Requirements
                     .OrderBy(x => x.DisplayOrder))
        {
            service.Requirements.Add(new ServiceRequirement
            {
                Id = Guid.NewGuid(),
                ServiceId = service.Id,
                Name = requirementDto.Name.Trim(),
                Description = requirementDto.Description?.Trim(),
                IsRequired = requirementDto.IsRequired,
                DisplayOrder = requirementDto.DisplayOrder
            });
        }

        _context.Services.Add(service);

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(service.Id))!;
    }
public async Task<ServiceDto?> UpdateAsync(
    Guid id,
    UpdateServiceDto dto)
{
    var service = await _context.Services
        .Include(x => x.Requirements)
        .FirstOrDefaultAsync(x => x.Id == id);

    if (service == null)
        return null;

    service.Name = dto.Name.Trim();
    service.Description = dto.Description?.Trim();
    service.Category = dto.Category.Trim();
    service.RequiresTraining = dto.RequiresTraining;
    service.IsActive = dto.IsActive;
    service.UpdatedAt = DateTime.UtcNow;

    // Remove existing requirements
    var existingRequirements = service.Requirements.ToList();

    if (existingRequirements.Count > 0)
    {
        _context.ServiceRequirements.RemoveRange(existingRequirements);
    }

    // Add the updated requirements
    var newRequirements = dto.Requirements
        .OrderBy(x => x.DisplayOrder)
        .Select(x => new ServiceRequirement
        {
            Id = Guid.NewGuid(),
            ServiceId = service.Id,
            Name = x.Name.Trim(),
            Description = x.Description?.Trim(),
            IsRequired = x.IsRequired,
            DisplayOrder = x.DisplayOrder
        })
        .ToList();

    await _context.ServiceRequirements.AddRangeAsync(
        newRequirements
    );

    await _context.SaveChangesAsync();

    return await GetByIdAsync(id);
}

    public async Task<bool> DeleteAsync(Guid id)
    {
        var service = await _context.Services
            .FirstOrDefaultAsync(x => x.Id == id);

        if (service == null)
            return false;

        var hasRequests = await _context.ServiceRequests
            .AnyAsync(x => x.ServiceId == id);

        if (hasRequests)
        {
            throw new InvalidOperationException(
                "This service cannot be deleted because it already has service requests."
            );
        }

        _context.Services.Remove(service);

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<ServiceRequestDto> CreateRequestAsync(
        Guid userId,
        CreateServiceRequestDto dto)
    {
        var service = await _context.Services
            .FirstOrDefaultAsync(x =>
                x.Id == dto.ServiceId &&
                x.IsActive);

        if (service == null)
        {
            throw new InvalidOperationException(
                "The selected service does not exist or is inactive."
            );
        }

        var existingPendingRequest = await _context.ServiceRequests
            .AnyAsync(x =>
                x.ServiceId == dto.ServiceId &&
                x.UserId == userId &&
                x.Status == ServiceRequestStatus.Pending);

        if (existingPendingRequest)
        {
            throw new InvalidOperationException(
                "You already have a pending request for this service."
            );
        }

        var request = new ServiceRequest
        {
            Id = Guid.NewGuid(),
            ServiceId = dto.ServiceId,
            UserId = userId,
            Remarks = dto.Remarks?.Trim(),
            Status = ServiceRequestStatus.Pending,
            RequestedAt = DateTime.UtcNow
        };

        _context.ServiceRequests.Add(request);

        await _context.SaveChangesAsync();

        return new ServiceRequestDto
        {
            Id = request.Id,
            ServiceId = request.ServiceId,
            UserId = request.UserId,
            Remarks = request.Remarks,
            Status = request.Status.ToString(),
            RequestedAt = request.RequestedAt,
            ReviewedAt = request.ReviewedAt,
            ReviewedByUserId = request.ReviewedByUserId
        };
    }
public async Task<List<ServiceRequestDto>> GetRequestsAsync()
{
    return await _context.ServiceRequests
        .AsNoTracking()
        .Include(x => x.Service)
        .Include(x => x.User)
        .OrderByDescending(x => x.RequestedAt)
        .Select(x => new ServiceRequestDto
        {
            Id = x.Id,

            ServiceId = x.ServiceId,
            ServiceName = x.Service.Name,

            UserId = x.UserId,
            ApplicantName = x.User.FullName,
            ApplicantEmail = x.User.Email,

            Remarks = x.Remarks,
            Status = x.Status.ToString(),
            RequestedAt = x.RequestedAt,
            ReviewedAt = x.ReviewedAt,
            ReviewedByUserId = x.ReviewedByUserId
        })
        .ToListAsync();
}   
public async Task<ServiceRequestDto?> GetRequestByIdAsync(Guid id)
{
    return await _context.ServiceRequests
        .AsNoTracking()
        .Include(x => x.Service)
        .Include(x => x.User)
        .Where(x => x.Id == id)
        .Select(x => new ServiceRequestDto
        {
            Id = x.Id,

            ServiceId = x.ServiceId,
            ServiceName = x.Service.Name,

            UserId = x.UserId,
            ApplicantName = x.User.FullName,
            ApplicantEmail = x.User.Email,

            Remarks = x.Remarks,
            Status = x.Status.ToString(),
            RequestedAt = x.RequestedAt,
            ReviewedAt = x.ReviewedAt,
            ReviewedByUserId = x.ReviewedByUserId
        })
        .FirstOrDefaultAsync();
}
public async Task<ServiceRequestDto?> UpdateRequestStatusAsync(
    Guid requestId,
    Guid adminUserId,
    UpdateServiceRequestStatusDto dto
)
{
    var request = await _context.ServiceRequests
        .FirstOrDefaultAsync(x => x.Id == requestId);

    if (request == null)
    {
        return null;
    }

    if (!Enum.TryParse<ServiceRequestStatus>(
        dto.Status,
        true,
        out var newStatus
    ))
    {
        throw new ArgumentException(
            "Invalid service request status."
        );
    }

    request.Status = newStatus;

    if (!string.IsNullOrWhiteSpace(dto.Remarks))
    {
        request.Remarks = dto.Remarks.Trim();
    }

    request.ReviewedAt = DateTime.UtcNow;
    request.ReviewedByUserId = adminUserId;

    await _context.SaveChangesAsync();

    return await GetRequestByIdAsync(requestId);
}
}