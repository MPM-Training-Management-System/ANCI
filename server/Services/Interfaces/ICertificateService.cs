using server.DTOs.Training;

namespace server.Services.Interfaces;

public interface ICertificateService
{
    Task<IReadOnlyList<CertificateDto>> GetByEnrollmentAsync(
        Guid enrollmentId);

    Task<CertificateDto?> GetByVerificationCodeAsync(
        string verificationCode);

    Task<IReadOnlyList<CertificateDto>> GetAllAsync();

    Task<IReadOnlyList<CertificateDto>> GenerateForEnrollmentAsync(
        Guid enrollmentId);

    Task<IReadOnlyList<EligibleCertificateDto>>
    GetEligibleAsync();
}