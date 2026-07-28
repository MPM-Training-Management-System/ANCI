using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace server.Services;

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration configuration)
    {
        var account = new Account(
            configuration["Cloudinary:CloudName"],
            configuration["Cloudinary:ApiKey"],
            configuration["Cloudinary:ApiSecret"]);

        _cloudinary = new Cloudinary(account);
    }

    public async Task<string?> UploadImageAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return null;

        await using var stream = file.OpenReadStream();

        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = "participants"
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        return result.SecureUrl.ToString();
    }
}