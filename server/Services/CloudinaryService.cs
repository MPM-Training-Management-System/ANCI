using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

using Microsoft.Extensions.Options;

using server.Services.Interfaces;
using server.Settings;

namespace server.Services;

public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(
        IOptions<CloudinarySettings> settings)
    {
        var config = settings.Value;

        if (
            string.IsNullOrWhiteSpace(config.CloudName) ||
            string.IsNullOrWhiteSpace(config.ApiKey) ||
            string.IsNullOrWhiteSpace(config.ApiSecret)
        )
        {
            throw new InvalidOperationException(
                "Cloudinary configuration is missing."
            );
        }

        var account = new Account(
            config.CloudName,
            config.ApiKey,
            config.ApiSecret
        );

        _cloudinary = new Cloudinary(account);
    }


    // =========================================================
    // UPLOAD IMAGE
    // =========================================================

    public async Task<string> UploadImageAsync(
        Stream fileStream,
        string fileName,
        string folder)
    {
        if (fileStream == null)
        {
            throw new ArgumentNullException(
                nameof(fileStream)
            );
        }

        if (fileStream.Length == 0)
        {
            throw new InvalidOperationException(
                "The uploaded file is empty."
            );
        }


        var extension =
            Path.GetExtension(fileName)
                .ToLowerInvariant();


        var allowedExtensions = new[]
{
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
};

if (!allowedExtensions.Contains(
        extension,
        StringComparer.OrdinalIgnoreCase))
{
    throw new InvalidOperationException(
        "Only PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG, and WEBP files are allowed."
    );
}


        var uploadParams =
            new ImageUploadParams
            {
                File =
                    new FileDescription(
                        fileName,
                        fileStream
                    ),

                Folder = folder,

                UseFilename = false,

                UniqueFilename = true,

                Overwrite = false
            };


        var result =
            await _cloudinary
                .UploadAsync(uploadParams);


        if (
            result.Error != null
        )
        {
            throw new InvalidOperationException(
                $"Cloudinary upload failed: {result.Error.Message}"
            );
        }


        if (
            string.IsNullOrWhiteSpace(
                result.SecureUrl?.ToString()
            )
        )
        {
            throw new InvalidOperationException(
                "Cloudinary did not return an image URL."
            );
        }


        return result
            .SecureUrl
            .ToString();
    }


    // =========================================================
    // DELETE IMAGE
    // =========================================================

    public async Task DeleteImageAsync(
        string imageUrl)
    {
        if (
            string.IsNullOrWhiteSpace(imageUrl)
        )
        {
            return;
        }


        var publicId =
            ExtractPublicIdFromUrl(
                imageUrl
            );


        if (
            string.IsNullOrWhiteSpace(publicId)
        )
        {
            return;
        }


        var deleteParams =
            new DeletionParams(
                publicId
            )
            {
                ResourceType =
                    ResourceType.Image
            };


        var result =
            await _cloudinary
                .DestroyAsync(
                    deleteParams
                );


        if (
            result.Error != null
        )
        {
            throw new InvalidOperationException(
                $"Cloudinary deletion failed: {result.Error.Message}"
            );
        }
    }


    // =========================================================
    // EXTRACT PUBLIC ID
    // =========================================================

    private static string?
        ExtractPublicIdFromUrl(
            string imageUrl)
    {
        if (
            !Uri.TryCreate(
                imageUrl,
                UriKind.Absolute,
                out var uri
            )
        )
        {
            return null;
        }


        var path =
            uri.AbsolutePath;


        var uploadIndex =
            path.IndexOf(
                "/upload/",
                StringComparison.OrdinalIgnoreCase
            );


        if (uploadIndex < 0)
        {
            return null;
        }


        var publicPath =
            path.Substring(
                uploadIndex + "/upload/".Length
            );


        // Remove transformations if present.
        if (
            publicPath.StartsWith("v")
        )
        {
            var slashIndex =
                publicPath.IndexOf('/');

            if (slashIndex >= 0)
            {
                var possibleVersion =
                    publicPath[..slashIndex];

                if (
                    possibleVersion.Length > 1 &&
                    possibleVersion
                        .Substring(1)
                        .All(char.IsDigit)
                )
                {
                    publicPath =
                        publicPath[
                            (slashIndex + 1)..];
                }
            }
        }


        // Remove extension.
        var extension =
            Path.GetExtension(
                publicPath
            );


        if (
            !string.IsNullOrWhiteSpace(
                extension
            )
        )
        {
            publicPath =
                publicPath[
                    ..^extension.Length];
        }


        return publicPath;
    }
    // =========================================================
// UPLOAD DOCUMENT
// =========================================================

// =========================================================
// UPLOAD DOCUMENT
// =========================================================

public async Task<(string Url, string PublicId)> UploadDocumentAsync(
    Stream fileStream,
    string fileName,
    string folder)
{
    if (fileStream == null)
    {
        throw new ArgumentNullException(nameof(fileStream));
    }

    if (fileStream.Length == 0)
    {
        throw new InvalidOperationException(
            "The uploaded file is empty."
        );
    }

    var extension =
        Path.GetExtension(fileName)
            .ToLowerInvariant();

    var imageExtensions = new[]
    {
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    };

    var documentExtensions = new[]
    {
        ".pdf",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
        ".ppt",
        ".pptx"
    };

    if (!imageExtensions.Contains(extension) &&
        !documentExtensions.Contains(extension))
    {
        throw new InvalidOperationException(
            "Only PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, JPEG, PNG, and WEBP files are allowed."
        );
    }

    // =====================================================
    // IMAGE
    // =====================================================

    if (imageExtensions.Contains(extension))
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(
                fileName,
                fileStream
            ),

            Folder = folder,

            UseFilename = false,
            UniqueFilename = true,
            Overwrite = false
        };

        var result =
            await _cloudinary.UploadAsync(uploadParams);

        if (result.Error != null)
        {
            throw new InvalidOperationException(
                $"Cloudinary image upload failed: {result.Error.Message}"
            );
        }

        var secureUrl =
            result.SecureUrl?.ToString();

        if (string.IsNullOrWhiteSpace(secureUrl))
        {
            throw new InvalidOperationException(
                "Cloudinary did not return an image URL."
            );
        }

        return (
            secureUrl,
            result.PublicId
        );
    }

    // =====================================================
    // DOCUMENT
    // =====================================================

    var documentUploadParams = new RawUploadParams
    {
        File = new FileDescription(
            fileName,
            fileStream
        ),

        Folder = folder,

        UseFilename = false,
        UniqueFilename = true,
        Overwrite = false
    };

    var documentResult =
        await _cloudinary.UploadAsync(
            documentUploadParams
        );

    if (documentResult.Error != null)
    {
        throw new InvalidOperationException(
            $"Cloudinary document upload failed: {documentResult.Error.Message}"
        );
    }

    var documentUrl =
        documentResult.SecureUrl?.ToString();

    if (string.IsNullOrWhiteSpace(documentUrl))
    {
        throw new InvalidOperationException(
            "Cloudinary did not return a document URL."
        );
    }

    return (
        documentUrl,
        documentResult.PublicId
    );
}

// =========================================================
// DELETE DOCUMENT
// =========================================================

public async Task DeleteDocumentAsync(
    string publicId)
{
    if (string.IsNullOrWhiteSpace(publicId))
    {
        return;
    }

    var deleteParams =
        new DeletionParams(
            publicId
        )
        {
            ResourceType =
                ResourceType.Raw
        };

    var result =
        await _cloudinary
            .DestroyAsync(
                deleteParams
            );

    if (result.Error != null)
    {
        throw new InvalidOperationException(
            $"Cloudinary document deletion failed: {result.Error.Message}"
        );
    }
}
}