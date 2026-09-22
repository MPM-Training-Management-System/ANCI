using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Service;
using server.Enums;
using server.Models.Service;
using server.Services.Email;
using server.Services.Interfaces;

namespace server.Services.Service;

public class ServiceService : IService
{
    private readonly ApplicationDbContext _context;
    private readonly IServiceEmailService _serviceEmailService;
    private readonly ICloudinaryService _cloudinaryService;

    public ServiceService(
        ApplicationDbContext context,
        IServiceEmailService serviceEmailService,
        ICloudinaryService cloudinaryService)
    {
        _context = context;
        _serviceEmailService = serviceEmailService;
        _cloudinaryService = cloudinaryService;
    }

    // =========================================================
    // SERVICES
    // =========================================================

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

                // Cloudinary URL
                ImageUrl = x.ImageUrl,

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

                // Cloudinary URL
                ImageUrl = x.ImageUrl,

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

    // =========================================================
    // CREATE SERVICE
    // =========================================================

    public async Task<ServiceDto> CreateAsync(
        CreateServiceDto dto)
    {
        var serviceCode =
            dto.ServiceCode.Trim().ToUpper();

        // =====================================================
        // VALIDATION
        // =====================================================

        if (string.IsNullOrWhiteSpace(dto.ServiceCode))
        {
            throw new InvalidOperationException(
                "Service code is required."
            );
        }

        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            throw new InvalidOperationException(
                "Service name is required."
            );
        }

        if (string.IsNullOrWhiteSpace(dto.Category))
        {
            throw new InvalidOperationException(
                "Service category is required."
            );
        }

        // =====================================================
        // CHECK DUPLICATE SERVICE CODE
        // =====================================================

        var exists = await _context.Services
            .AnyAsync(x =>
                x.ServiceCode == serviceCode);

        if (exists)
        {
            throw new InvalidOperationException(
                "A service with this service code already exists."
            );
        }

        // =====================================================
        // UPLOAD IMAGE TO CLOUDINARY
        // =====================================================

        string? imageUrl = null;

        if (dto.Image != null && dto.Image.Length > 0)
        {
            await using var stream =
                dto.Image.OpenReadStream();

            imageUrl =
                await _cloudinaryService.UploadImageAsync(
                    stream,
                    dto.Image.FileName,
                    "ace-nextgen/services"
                );
        }

        // =====================================================
        // CREATE SERVICE
        // =====================================================

        var now = DateTime.UtcNow;

        var service =
            new Models.Service.Service
            {
                Id = Guid.NewGuid(),

                ServiceCode =
                    serviceCode,

                Name =
                    dto.Name.Trim(),

                Description =
                    dto.Description?.Trim(),

                Category =
                    dto.Category.Trim(),

                ImageUrl =
                    imageUrl,

                RequiresTraining =
                    dto.RequiresTraining,

                IsActive =
                    true,

                CreatedAt =
                    now,

                UpdatedAt =
                    now
            };

        // =====================================================
        // REQUIREMENTS
        // =====================================================

        foreach (
            var requirementDto in dto.Requirements
                .OrderBy(x => x.DisplayOrder))
        {
            service.Requirements.Add(
                new ServiceRequirement
                {
                    Id = Guid.NewGuid(),

                    ServiceId =
                        service.Id,

                    Name =
                        requirementDto.Name.Trim(),

                    Description =
                        requirementDto.Description?.Trim(),

                    IsRequired =
                        requirementDto.IsRequired,

                    DisplayOrder =
                        requirementDto.DisplayOrder
                }
            );
        }

        // =====================================================
        // SAVE
        // =====================================================

        _context.Services.Add(service);

        await _context.SaveChangesAsync();

        return (await GetByIdAsync(service.Id))!;
    }

    // =========================================================
    // UPDATE SERVICE
    // =========================================================

    public async Task<ServiceDto?> UpdateAsync(
        Guid id,
        UpdateServiceDto dto)
    {
        var service = await _context.Services
            .Include(x => x.Requirements)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (service == null)
        {
            return null;
        }

        // =====================================================
        // REMOVE IMAGE
        // =====================================================

        if (dto.RemoveImage)
        {
            if (!string.IsNullOrWhiteSpace(service.ImageUrl))
            {
                try
                {
                    await _cloudinaryService
                        .DeleteImageAsync(
                            service.ImageUrl
                        );
                }
                catch (Exception ex)
                {
                    Console.WriteLine(
                        $"Failed to delete service image from Cloudinary: {ex.Message}"
                    );
                }
            }

            service.ImageUrl = null;
        }

        // =====================================================
        // UPLOAD NEW IMAGE
        // =====================================================

        if (dto.Image != null && dto.Image.Length > 0)
        {
            // Delete old image first
            if (!string.IsNullOrWhiteSpace(service.ImageUrl))
            {
                try
                {
                    await _cloudinaryService
                        .DeleteImageAsync(
                            service.ImageUrl
                        );
                }
                catch (Exception ex)
                {
                    Console.WriteLine(
                        $"Failed to delete old service image from Cloudinary: {ex.Message}"
                    );
                }
            }

            await using var stream =
                dto.Image.OpenReadStream();

            var newImageUrl =
                await _cloudinaryService.UploadImageAsync(
                    stream,
                    dto.Image.FileName,
                    "ace-nextgen/services"
                );

            service.ImageUrl =
                newImageUrl;
        }

        // =====================================================
        // UPDATE SERVICE INFORMATION
        // =====================================================

        service.Name =
            dto.Name.Trim();

        service.Description =
            dto.Description?.Trim();

        service.Category =
            dto.Category.Trim();

        service.RequiresTraining =
            dto.RequiresTraining;

        service.IsActive =
            dto.IsActive;

        service.UpdatedAt =
            DateTime.UtcNow;

        // =====================================================
        // REMOVE OLD REQUIREMENTS
        // =====================================================

        var existingRequirements =
            service.Requirements.ToList();

        if (existingRequirements.Count > 0)
        {
            _context.ServiceRequirements.RemoveRange(
                existingRequirements
            );
        }

        // =====================================================
        // ADD NEW REQUIREMENTS
        // =====================================================

        var newRequirements =
            dto.Requirements
                .OrderBy(x => x.DisplayOrder)
                .Select(x => new ServiceRequirement
                {
                    Id = Guid.NewGuid(),

                    ServiceId =
                        service.Id,

                    Name =
                        x.Name.Trim(),

                    Description =
                        x.Description?.Trim(),

                    IsRequired =
                        x.IsRequired,

                    DisplayOrder =
                        x.DisplayOrder
                })
                .ToList();

        await _context.ServiceRequirements.AddRangeAsync(
            newRequirements
        );

        // =====================================================
        // SAVE
        // =====================================================

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    // =========================================================
    // DELETE SERVICE
    // =========================================================

    public async Task<bool> DeleteAsync(Guid id)
    {
        var service = await _context.Services
            .FirstOrDefaultAsync(x => x.Id == id);

        if (service == null)
        {
            return false;
        }

        // =====================================================
        // CHECK SERVICE REQUESTS
        // =====================================================

        var hasRequests =
            await _context.ServiceRequests
                .AnyAsync(x =>
                    x.ServiceId == id);

        if (hasRequests)
        {
            throw new InvalidOperationException(
                "This service cannot be deleted because it already has service requests."
            );
        }

        // =====================================================
        // DELETE CLOUDINARY IMAGE
        // =====================================================

        if (!string.IsNullOrWhiteSpace(service.ImageUrl))
        {
            try
            {
                await _cloudinaryService
                    .DeleteImageAsync(
                        service.ImageUrl
                    );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Failed to delete service image from Cloudinary: {ex.Message}"
                );
            }
        }

        // =====================================================
        // DELETE SERVICE
        // =====================================================

        _context.Services.Remove(service);

        await _context.SaveChangesAsync();

        return true;
    }

    // =========================================================
    // SERVICE REQUESTS
    // =========================================================

    public async Task<ServiceRequestDto> CreateRequestAsync(
        Guid? userId,
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

        var applicantName =
            dto.ApplicantName.Trim();

        var applicantEmail =
            dto.ApplicantEmail.Trim();

        if (string.IsNullOrWhiteSpace(applicantName))
        {
            throw new ArgumentException(
                "Applicant name is required."
            );
        }

        if (string.IsNullOrWhiteSpace(applicantEmail))
        {
            throw new ArgumentException(
                "Applicant email is required."
            );
        }

        // =====================================================
        // PREVENT DUPLICATE PENDING REQUESTS
        // =====================================================

        var existingPendingRequest =
            await _context.ServiceRequests
                .AnyAsync(x =>
                    x.ServiceId == dto.ServiceId &&
                    x.Status ==
                        ServiceRequestStatus.Pending &&
                    (
                        (
                            userId.HasValue &&
                            x.UserId ==
                                userId.Value
                        )
                        ||
                        (
                            !userId.HasValue &&
                            x.ApplicantEmail ==
                                applicantEmail
                        )
                    )
                );

        if (existingPendingRequest)
        {
            throw new InvalidOperationException(
                "You already have a pending request for this service."
            );
        }

        // =====================================================
        // CREATE REQUEST
        // =====================================================

        var request = new ServiceRequest
        {
            Id = Guid.NewGuid(),

            ServiceId =
                dto.ServiceId,

            UserId =
                userId,

            ApplicantName =
                applicantName,

            ApplicantEmail =
                applicantEmail,

            Remarks =
                dto.Remarks?.Trim(),

            Status =
                ServiceRequestStatus.Pending,

            RequestedAt =
                DateTime.UtcNow
        };

        _context.ServiceRequests.Add(request);

        await _context.SaveChangesAsync();

        // =====================================================
        // EMAIL: APPLICATION RECEIVED
        // =====================================================

        try
        {
            request.Service = service;

            await _serviceEmailService
                .SendRequestSubmittedAsync(
                    request
                );
        }
        catch (Exception ex)
        {
            Console.WriteLine(
                $"Failed to send service request email: {ex.Message}"
            );
        }

        return new ServiceRequestDto
        {
            Id =
                request.Id,

            ServiceId =
                request.ServiceId,

            ServiceName =
                service.Name,

            UserId =
                request.UserId,

            ApplicantName =
                request.ApplicantName,

            ApplicantEmail =
                request.ApplicantEmail,

            Remarks =
                request.Remarks,

            Status =
                request.Status.ToString(),

            ResolutionType =
                request.ResolutionType?.ToString(),

            AdminRemarks =
                request.AdminRemarks,

            RequestedAt =
                request.RequestedAt,

            ReviewedAt =
                request.ReviewedAt,

            ReviewedByUserId =
                request.ReviewedByUserId
        };
    }

    // =========================================================
    // GET REQUESTS
    // =========================================================

    public async Task<List<ServiceRequestDto>>
        GetRequestsAsync()
    {
        return await _context.ServiceRequests
            .AsNoTracking()
            .Include(x => x.Service)
            .OrderByDescending(
                x => x.RequestedAt)
            .Select(x => new ServiceRequestDto
            {
                Id =
                    x.Id,

                ServiceId =
                    x.ServiceId,

                ServiceName =
                    x.Service.Name,

                UserId =
                    x.UserId,

                ApplicantName =
                    x.ApplicantName,

                ApplicantEmail =
                    x.ApplicantEmail,

                Remarks =
                    x.Remarks,

                Status =
                    x.Status.ToString(),

                ResolutionType =
                    x.ResolutionType != null
                        ? x.ResolutionType.ToString()
                        : null,

                AdminRemarks =
                    x.AdminRemarks,

                RequestedAt =
                    x.RequestedAt,

                ReviewedAt =
                    x.ReviewedAt,

                ReviewedByUserId =
                    x.ReviewedByUserId
            })
            .ToListAsync();
    }

    // =========================================================
    // GET REQUEST BY ID
    // =========================================================

    public async Task<ServiceRequestDto?>
        GetRequestByIdAsync(Guid id)
    {
        return await _context.ServiceRequests
            .AsNoTracking()
            .Include(x => x.Service)
            .Where(x => x.Id == id)
            .Select(x => new ServiceRequestDto
            {
                Id =
                    x.Id,

                ServiceId =
                    x.ServiceId,

                ServiceName =
                    x.Service.Name,

                UserId =
                    x.UserId,

                ApplicantName =
                    x.ApplicantName,

                ApplicantEmail =
                    x.ApplicantEmail,

                Remarks =
                    x.Remarks,

                Status =
                    x.Status.ToString(),

                ResolutionType =
                    x.ResolutionType != null
                        ? x.ResolutionType.ToString()
                        : null,

                AdminRemarks =
                    x.AdminRemarks,

                RequestedAt =
                    x.RequestedAt,

                ReviewedAt =
                    x.ReviewedAt,

                ReviewedByUserId =
                    x.ReviewedByUserId
            })
            .FirstOrDefaultAsync();
    }

    // =========================================================
    // REVIEW SERVICE REQUEST
    // =========================================================

    public async Task<ServiceRequestDto?>
        ReviewRequestAsync(
            Guid requestId,
            Guid adminUserId,
            ReviewServiceRequestDto dto)
    {
        var request =
            await _context.ServiceRequests
                .Include(x => x.Service)
                .FirstOrDefaultAsync(
                    x => x.Id == requestId
                );

        if (request is null)
        {
            return null;
        }

        // =====================================================
        // PREVIOUS STATUS
        // =====================================================

        var previousStatus =
            request.Status;

        // =====================================================
        // RESOLUTION
        // =====================================================

        if (
            dto.Status ==
            ServiceRequestStatus.Rejected
        )
        {
            request.ResolutionType =
                null;
        }
        else
        {
            if (!dto.ResolutionType.HasValue)
            {
                throw new InvalidOperationException(
                    "Resolution type is required when approving a service request."
                );
            }

            request.ResolutionType =
                dto.ResolutionType.Value;
        }

        // =====================================================
        // UPDATE REQUEST
        // =====================================================

        request.Status =
            dto.Status;

        request.AdminRemarks =
            string.IsNullOrWhiteSpace(
                dto.AdminRemarks)
                ? null
                : dto.AdminRemarks.Trim();

        request.ReviewedAt =
            DateTime.UtcNow;

        request.ReviewedByUserId =
            adminUserId;

        await _context.SaveChangesAsync();

        // =====================================================
        // EMAIL
        // =====================================================

        if (
            previousStatus !=
            request.Status
        )
        {
            try
            {
                await _serviceEmailService
                    .SendRequestStatusChangedAsync(
                        request,
                        previousStatus
                    );
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    $"Failed to send service status email: {ex.Message}"
                );
            }
        }

        return new ServiceRequestDto
        {
            Id =
                request.Id,

            ServiceId =
                request.ServiceId,

            ServiceName =
                request.Service.Name,

            UserId =
                request.UserId,

            ApplicantName =
                request.ApplicantName,

            ApplicantEmail =
                request.ApplicantEmail,

            Remarks =
                request.Remarks,

            Status =
                request.Status.ToString(),

            ResolutionType =
                request.ResolutionType?.ToString(),

            AdminRemarks =
                request.AdminRemarks,

            RequestedAt =
                request.RequestedAt,

            ReviewedAt =
                request.ReviewedAt,

            ReviewedByUserId =
                request.ReviewedByUserId
        };
    }
}