using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Service;
using server.Enums;
using server.Models.Service;
using server.Services.Email;

namespace server.Services.Service;

public class ServiceConsultationService
    : IServiceConsultationService
{
    private readonly ApplicationDbContext _context;
    private readonly IServiceEmailService _serviceEmailService;

    public ServiceConsultationService(
        ApplicationDbContext context,
        IServiceEmailService serviceEmailService
    )
    {
        _context = context;
        _serviceEmailService = serviceEmailService;
    }

    public async Task<ServiceConsultationDto?> CreateAsync(
        Guid adminUserId,
        CreateServiceConsultationDto dto
    )
    {
        var request = await _context.ServiceRequests
            .Include(x => x.Service)
            .FirstOrDefaultAsync(
                x => x.Id == dto.ServiceRequestId
            );

        if (request is null)
            return null;

        if (
            request.Status !=
            ServiceRequestStatus.Approved
        )
        {
            throw new InvalidOperationException(
                "Only approved service requests can be scheduled for consultation."
            );
        }

        if (
            request.ResolutionType !=
            ServiceRequestResolutionType.Consultation
        )
        {
            throw new InvalidOperationException(
                "This service request is not resolved as a consultation."
            );
        }

        var existingConsultation =
            await _context.ServiceConsultations
                .AnyAsync(
                    x =>
                        x.ServiceRequestId ==
                        dto.ServiceRequestId
                );

        if (existingConsultation)
        {
            throw new InvalidOperationException(
                "A consultation has already been scheduled for this service request."
            );
        }

        if (
            string.IsNullOrWhiteSpace(
                dto.MeetingLink
            )
        )
        {
            throw new InvalidOperationException(
                "Meeting link is required."
            );
        }

        /*
         * Normalize ScheduledAt to UTC.
         */
        var scheduledAtUtc =
            dto.ScheduledAt.Kind switch
            {
                DateTimeKind.Utc =>
                    dto.ScheduledAt,

                DateTimeKind.Local =>
                    dto.ScheduledAt
                        .ToUniversalTime(),

                _ =>
                    DateTime.SpecifyKind(
                        dto.ScheduledAt,
                        DateTimeKind.Utc
                    )
            };

        if (
            scheduledAtUtc <=
            DateTime.UtcNow
        )
        {
            throw new InvalidOperationException(
                "Consultation schedule must be in the future."
            );
        }

        var now =
            DateTime.UtcNow;

        var consultation =
            new ServiceConsultation
            {
                Id = Guid.NewGuid(),

                ServiceRequestId =
                    dto.ServiceRequestId,

                ScheduledAt =
                    scheduledAtUtc,

                MeetingLink =
                    dto.MeetingLink.Trim(),

                Notes =
                    string.IsNullOrWhiteSpace(
                        dto.Notes
                    )
                        ? null
                        : dto.Notes.Trim(),

                Status =
                    ServiceConsultationStatus.Scheduled,

                CreatedAt =
                    now,

                UpdatedAt =
                    now
            };

        _context.ServiceConsultations.Add(
            consultation
        );

        /*
         * The consultation is now scheduled,
         * so synchronize the parent service request.
         */
        request.Status =
            ServiceRequestStatus.Scheduled;

        request.ReviewedAt ??= now;

        await _context.SaveChangesAsync();

        // =====================================================
        // EMAIL: CONSULTATION SCHEDULED
        // =====================================================

        try
        {
            await _serviceEmailService
                .SendConsultationScheduledAsync(
                    request,
                    consultation
                );
        }
        catch (Exception ex)
        {
            /*
             * Database transaction already succeeded.
             * Email failure should not fail the consultation.
             */
            Console.WriteLine(
                $"Failed to send consultation scheduled email: {ex.Message}"
            );
        }

        return MapToDto(
            consultation,
            request
        );
    }

    public async Task<
        List<ServiceConsultationDto>
    > GetAllAsync()
    {
        var consultations =
            await _context.ServiceConsultations
                .Include(x => x.ServiceRequest)
                    .ThenInclude(x => x.Service)
                .OrderByDescending(
                    x => x.ScheduledAt
                )
                .ToListAsync();

        return consultations
            .Select(
                x =>
                    MapToDto(
                        x,
                        x.ServiceRequest
                    )
            )
            .ToList();
    }

    public async Task<
        ServiceConsultationDto?
    > GetByIdAsync(
        Guid id
    )
    {
        var consultation =
            await _context.ServiceConsultations
                .Include(x => x.ServiceRequest)
                    .ThenInclude(x => x.Service)
                .FirstOrDefaultAsync(
                    x => x.Id == id
                );

        if (consultation is null)
            return null;

        return MapToDto(
            consultation,
            consultation.ServiceRequest
        );
    }

    public async Task<
        ServiceConsultationDto?
    > UpdateAsync(
        Guid id,
        UpdateServiceConsultationDto dto
    )
    {
        var consultation =
            await _context.ServiceConsultations
                .Include(x => x.ServiceRequest)
                    .ThenInclude(x => x.Service)
                .FirstOrDefaultAsync(
                    x => x.Id == id
                );

        if (consultation is null)
            return null;

        if (
            string.IsNullOrWhiteSpace(
                dto.MeetingLink
            )
        )
        {
            throw new InvalidOperationException(
                "Meeting link is required."
            );
        }

        /*
         * Normalize incoming schedule to UTC.
         */
        var scheduledAtUtc =
            dto.ScheduledAt.Kind switch
            {
                DateTimeKind.Utc =>
                    dto.ScheduledAt,

                DateTimeKind.Local =>
                    dto.ScheduledAt
                        .ToUniversalTime(),

                _ =>
                    DateTime.SpecifyKind(
                        dto.ScheduledAt,
                        DateTimeKind.Utc
                    )
            };

        /*
         * Only Scheduled consultations
         * require a future schedule.
         */
        if (
            dto.Status ==
            ServiceConsultationStatus.Scheduled
            &&
            scheduledAtUtc <=
            DateTime.UtcNow
        )
        {
            throw new InvalidOperationException(
                "Consultation schedule must be in the future."
            );
        }

        // =====================================================
        // SAVE PREVIOUS STATUS
        // =====================================================

        var previousStatus =
            consultation.Status;

        // =====================================================
        // UPDATE CONSULTATION
        // =====================================================

        consultation.ScheduledAt =
            scheduledAtUtc;

        consultation.MeetingLink =
            dto.MeetingLink.Trim();

        consultation.Notes =
            string.IsNullOrWhiteSpace(
                dto.Notes
            )
                ? null
                : dto.Notes.Trim();

        consultation.Status =
            dto.Status;

        consultation.UpdatedAt =
            DateTime.UtcNow;

        // =====================================================
        // UPDATE ENDED AT
        // =====================================================

        if (
            dto.Status ==
            ServiceConsultationStatus.Completed
        )
        {
            consultation.EndedAt =
                DateTime.UtcNow;
        }
        else
        {
            consultation.EndedAt = null;
        }

        // =====================================================
        // SYNCHRONIZE SERVICE REQUEST STATUS
        // =====================================================

        switch (dto.Status)
        {
            case ServiceConsultationStatus.Scheduled:

                consultation.ServiceRequest.Status =
                    ServiceRequestStatus.Scheduled;

                break;

            case ServiceConsultationStatus.InProgress:

                consultation.ServiceRequest.Status =
                    ServiceRequestStatus.InProgress;

                break;

            case ServiceConsultationStatus.Completed:

                consultation.ServiceRequest.Status =
                    ServiceRequestStatus.Completed;

                break;

            case ServiceConsultationStatus.Cancelled:

                consultation.ServiceRequest.Status =
                    ServiceRequestStatus.Cancelled;

                break;
        }

        await _context.SaveChangesAsync();

        // =====================================================
        // EMAIL: CONSULTATION STATUS CHANGE
        // =====================================================

        if (
            previousStatus !=
            consultation.Status
        )
        {
            try
            {
                await _serviceEmailService
                    .SendConsultationStatusChangedAsync(
                        consultation.ServiceRequest,
                        consultation,
                        previousStatus
                    );
            }
            catch (Exception ex)
            {
                /*
                 * Database update already succeeded.
                 * Email failure should not roll back the update.
                 */
                Console.WriteLine(
                    $"Failed to send consultation status email: {ex.Message}"
                );
            }
        }

        return MapToDto(
            consultation,
            consultation.ServiceRequest
        );
    }

    // =========================================================
    // MAPPING
    // =========================================================

    private static ServiceConsultationDto
        MapToDto(
            ServiceConsultation consultation,
            ServiceRequest request
        )
    {
        return new ServiceConsultationDto
        {
            Id =
                consultation.Id,

            ServiceRequestId =
                consultation.ServiceRequestId,

            ServiceName =
                request.Service?.Name,

            ApplicantName =
                request.ApplicantName,

            ApplicantEmail =
                request.ApplicantEmail,

            ScheduledAt =
                consultation.ScheduledAt,

            EndedAt =
                consultation.EndedAt,

            MeetingLink =
                consultation.MeetingLink,

            Notes =
                consultation.Notes,

            Status =
                consultation.Status.ToString(),

            CreatedAt =
                consultation.CreatedAt,

            UpdatedAt =
                consultation.UpdatedAt
        };
    }
}