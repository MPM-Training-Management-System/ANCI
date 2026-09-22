namespace server.Services.Interfaces;

public interface ICertificatePdfService
{
    Task<Stream> GenerateAsync(
        string participantName,
        string trainingName,
        string batchCode,
        string certificateNumber,
        DateTime issuedAt,
        string verificationCode,
        string certificateType);
}