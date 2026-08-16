using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace server.Services;

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration configuration)
    {
        var cloudName =
            configuration["Cloudinary:CloudName"];

        var apiKey =
            configuration["Cloudinary:ApiKey"];

        var apiSecret =
            configuration["Cloudinary:ApiSecret"];

        if (string.IsNullOrWhiteSpace(cloudName))
        {
            throw new InvalidOperationException(
                "Cloudinary:CloudName is missing."
            );
        }

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException(
                "Cloudinary:ApiKey is missing."
            );
        }

        if (string.IsNullOrWhiteSpace(apiSecret))
        {
            throw new InvalidOperationException(
                "Cloudinary:ApiSecret is missing."
            );
        }

        var account = new Account(
            cloudName,
            apiKey,
            apiSecret
        );

        _cloudinary = new Cloudinary(account);
    }

    // =====================================================
    // GENERAL IMAGE UPLOAD
    // =====================================================

    public async Task<string> UploadImageAsync(
        IFormFile file,
        string folder = "uploads"
    )
    {
        if (file == null)
        {
            throw new ArgumentNullException(
                nameof(file),
                "Uploaded file is null."
            );
        }

        if (file.Length <= 0)
        {
            throw new ArgumentException(
                "Uploaded file is empty.",
                nameof(file)
            );
        }

        if (string.IsNullOrWhiteSpace(
                file.FileName))
        {
            throw new ArgumentException(
                "Uploaded file has no file name.",
                nameof(file)
            );
        }

        await using var stream =
            file.OpenReadStream();

        var uploadParams =
            new ImageUploadParams
            {
                File =
                    new FileDescription(
                        file.FileName,
                        stream
                    ),

                Folder = folder
            };

        ImageUploadResult result;

        try
        {
            result =
                await _cloudinary.UploadAsync(
                    uploadParams
                );
        }
        catch (Exception ex)
        {
            throw new Exception(
                $"Cloudinary request failed for '{file.FileName}': {ex.Message}",
                ex
            );
        }

        if (result == null)
        {
            throw new Exception(
                "Cloudinary returned a null response."
            );
        }

        if (result.Error != null)
        {
            throw new Exception(
                $"Cloudinary upload failed for '{file.FileName}': {result.Error.Message}"
            );
        }

        if (result.SecureUrl == null)
        {
            throw new Exception(
                $"Cloudinary uploaded '{file.FileName}' but returned no secure URL."
            );
        }

        return result.SecureUrl.ToString();
    }

    // =====================================================
    // TRAINER PROFILE IMAGE
    // =====================================================

    public async Task<string>
        UploadTrainerProfileAsync(
            IFormFile file)
    {
        return await UploadImageAsync(
            file,
            "trainers/profile"
        );
    }

    // =====================================================
    // TRAINER VALID ID
    // =====================================================

    public async Task<string>
        UploadTrainerValidIdAsync(
            IFormFile file)
    {
        return await UploadImageAsync(
            file,
            "trainers/valid-id"
        );
    }

    // =====================================================
    // PARTICIPANT PROFILE IMAGE
    // =====================================================

    public async Task<string>
        UploadParticipantProfileAsync(
            IFormFile file)
    {
        return await UploadImageAsync(
            file,
            "participants/profile"
        );
    }

    // =====================================================
    // PARTICIPANT VALID ID
    // =====================================================

    public async Task<string>
        UploadParticipantValidIdAsync(
            IFormFile file)
    {
        return await UploadImageAsync(
            file,
            "participants/valid-id"
        );
    }
}