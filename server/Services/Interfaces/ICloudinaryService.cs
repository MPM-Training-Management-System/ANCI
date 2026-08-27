namespace server.Services.Interfaces;

public interface ICloudinaryService
{
    Task<string> UploadImageAsync(
        Stream fileStream,
        string fileName,
        string folder);

    Task DeleteImageAsync(
        string imageUrl);
}