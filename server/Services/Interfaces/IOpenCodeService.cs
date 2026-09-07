namespace server.Services.Interfaces;

public interface IOpenCodeService
{
    Task<string> RunAsync(
        string prompt,
        CancellationToken cancellationToken = default);

    Task<string> RunWithImagesAsync(
        string prompt,
        IReadOnlyList<string> imagePaths,
        CancellationToken cancellationToken = default);
}