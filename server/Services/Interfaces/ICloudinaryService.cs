namespace server.Services.Interfaces;

public interface ICloudinaryService
{
    Task<string> UploadImageAsync(
        Stream fileStream,
        string fileName,
        string folder);

    Task DeleteImageAsync(
        string imageUrl);

        Task<(string Url, string PublicId)> UploadDocumentAsync(
    Stream fileStream,
    string fileName,
    string folder
);

Task DeleteDocumentAsync(
    string publicId
);

Task<(string Url, string PublicId)> UploadCertificatePdfAsync(
    Stream fileStream,
    string fileName,
    string folder);
}