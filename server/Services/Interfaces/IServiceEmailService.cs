using server.Enums;
using server.Models.Service;

namespace server.Services.Email;

public interface IServiceEmailService
{
    Task SendRequestSubmittedAsync(
        ServiceRequest request
    );

    Task SendRequestStatusChangedAsync(
        ServiceRequest request,
        ServiceRequestStatus previousStatus
    );

    Task SendTrainingApprovalAsync(
        ServiceRequest request
    );

    Task SendConsultationScheduledAsync(
        ServiceRequest request,
        ServiceConsultation consultation
    );

    Task SendConsultationStatusChangedAsync(
        ServiceRequest request,
        ServiceConsultation consultation,
        ServiceConsultationStatus previousStatus
    );
}