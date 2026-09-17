using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Service;
using server.Enums;
using server.Models.Service;
using server.Services.Email;

namespace server.Services.Service;

public class ServiceService : IService
{
    private readonly ApplicationDbContext _context;
    private readonly IServiceEmailService _serviceEmailService;

    public ServiceService(
        ApplicationDbContext context,
        IServiceEmailService serviceEmailService)
    {
        _context = context;
        _serviceEmailService = serviceEmailService;
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

    public async Task<ServiceDto> CreateAsync(
        CreateServiceDto dto)
    {
        var serviceCode =
            dto.ServiceCode.Trim().ToUpper();

        var exists = await _context.Services
            .AnyAsync(x =>
                x.ServiceCode == serviceCode);

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

        foreach (
            var requirementDto in dto.Requirements
                .OrderBy(x => x.DisplayOrder))
        {
            service.Requirements.Add(
                new ServiceRequirement
                {
                    Id = Guid.NewGuid(),
                    ServiceId = service.Id,
                    Name = requirementDto.Name.Trim(),
                    Description =
                        requirementDto.Description?.Trim(),
                    IsRequired =
                        requirementDto.IsRequired,
                    DisplayOrder =
                        requirementDto.DisplayOrder
                }
            );
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
        {
            return null;
        }

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

        // Remove existing requirements
        var existingRequirements =
            service.Requirements.ToList();

        if (existingRequirements.Count > 0)
        {
            _context.ServiceRequirements.RemoveRange(
                existingRequirements
            );
        }

        // Add updated requirements
        var newRequirements =
            dto.Requirements
                .OrderBy(x => x.DisplayOrder)
                .Select(x => new ServiceRequirement
                {
                    Id = Guid.NewGuid(),
                    ServiceId = service.Id,
                    Name = x.Name.Trim(),
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

        await _context.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var service = await _context.Services
            .FirstOrDefaultAsync(x => x.Id == id);

        if (service == null)
        {
            return false;
        }

        var hasRequests = await _context.ServiceRequests
            .AnyAsync(x =>
                x.ServiceId == id);

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

        if (string.IsNullOrWhiteSpace(
                applicantName))
        {
            throw new ArgumentException(
                "Applicant name is required."
            );
        }

        if (string.IsNullOrWhiteSpace(
                applicantEmail))
        {
            throw new ArgumentException(
                "Applicant email is required."
            );
        }

        // Prevent duplicate pending requests.
        //
        // If the applicant is a registered user,
        // check using UserId.
        //
        // If the request is from the public landing page,
        // check using email instead.
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
            // Load the navigation property so the
            // email service has access to Service.Name.
            request.Service = service;

            await _serviceEmailService
                .SendRequestSubmittedAsync(
                    request
                );
        }
        catch (Exception ex)
        {
            // The service request was already saved successfully.
            // Email failure should not cause the request to fail.
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

        // Save previous status so we only send
        // an email when the status actually changes.
        var previousStatus =
            request.Status;

        // =====================================================
        // RESOLUTION
        // =====================================================

        // A rejected request does not need a resolution.
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
            // Resolution is required when approving a request.
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
        // EMAIL: STATUS CHANGE
        // =====================================================

        if (
            previousStatus !=
            request.Status
        )
        {
            try
            {
                // IMPORTANT:
                //
                // This now uses IServiceEmailService.
                //
                // For:
                // Approved + Training
                //
                // ServiceEmailService will automatically
                // call SendTrainingApprovalAsync()
                // and send the NEW branded training email.
                await _serviceEmailService
                    .SendRequestStatusChangedAsync(
                        request,
                        previousStatus
                    );
            }
            catch (Exception ex)
            {
                // The status update already succeeded.
                // Do not roll back the request because
                // of email failure.
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