using System.Text;
using System.Text.Json;
using server.DTOs.Training.LearningMaterials;
using server.Services.DocumentExtraction;
using server.Services.Interfaces;

namespace server.Services.Training;

public class LearningMaterialAiService : ILearningMaterialAiService
{
    private readonly IOpenCodeService _openCodeService;

    public LearningMaterialAiService(
        IOpenCodeService openCodeService)
    {
        _openCodeService = openCodeService;
    }

    // ============================================================
    // TEXT ONLY
    // ============================================================

    public async Task<AiLearningMaterialResult> StructureLearningMaterialAsync(
        string rawText,
        string materialTitle,
        CancellationToken cancellationToken = default)
    {
        return await StructureLearningMaterialAsync(
            rawText,
            materialTitle,
            [],
            [],
            cancellationToken);
    }

    // ============================================================
    // TEXT + IMAGES
    // ============================================================

    public async Task<AiLearningMaterialResult> StructureLearningMaterialAsync(
        string rawText,
        string materialTitle,
        IReadOnlyList<DocumentImage> images,
        IReadOnlyList<DocumentMediaLink> mediaLinks,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(rawText))
        {
            throw new InvalidOperationException(
                "Learning material has no extracted text.");
        }

        if (string.IsNullOrWhiteSpace(materialTitle))
        {
            throw new ArgumentException(
                "Learning material title is required.",
                nameof(materialTitle));
        }

        images ??= [];
        mediaLinks ??= [];

        /*
         * =========================================================
         * SYSTEM PROMPT
         * =========================================================
         */

        var systemPrompt = """
You are an instructional content structuring assistant.

Your task is to transform extracted training material into
well-organized learning modules and sections.

IMPORTANT SOURCE RULES:

1. Use ONLY information contained in the provided source.
2. Do not invent facts, examples, policies, procedures, requirements,
   image URLs, video URLs, or other information.
3. Preserve the original meaning.
4. Remove duplicated headers, footers, page numbers, and extraction noise.
5. Repair broken paragraphs caused by document extraction.
6. Combine sentences that were incorrectly separated by page breaks.
7. Group related topics into logical modules.
8. Divide long modules into readable sections.
9. Each section must contain coherent instructional content.
10. Keep important definitions, procedures, lists, and examples.
11. Do not summarize so aggressively that important information is lost.
12. Write clean, readable instructional text.
13. Do not create a new module for every heading.
14. Prefer 3 to 8 sections per module when the source supports it.
15. Do not force a specific number of modules.
16. Do not create sections containing only one sentence unless
    the source itself contains a short definition.

MEDIA RULES:

17. A section may have ContentType:
    - "Text"
    - "Image"
    - "Video"

18. Use "Image" ONLY when an actual source image is relevant
    to the section.

19. Use "Video" ONLY when an actual video reference or YouTube URL
    is relevant to the section.

20. NEVER invent an image URL.

21. NEVER invent a YouTube URL.

22. NEVER modify, shorten, or fabricate a media URL.

23. If a media URL is provided in the source information,
    copy the URL exactly into MediaUrl.

24. Text sections must have MediaUrl = null.

25. Image sections must contain the exact Cloudinary image URL
    supplied by the application.

26. Video sections must contain the exact video URL supplied
    by the application.

27. If no relevant media exists, use "Text".

28. Media should only be assigned to a section when it is
    supported by the source material.

29. Do not create a media section simply because media exists.
    Use media when it improves the organization of the source.

IMAGE UNDERSTANDING RULES:

30. Images attached to this request are actual source images
    extracted from the training material.

31. Inspect the attached images when deciding whether an image
    belongs to a section.

32. Do not invent information from an image.

33. If text inside an image is readable, use it only when it
    is clearly relevant to the section.

34. Do not create an Image section merely because an image exists.

35. If an image is relevant, use its exact SOURCE_IMAGE identifier
    and exact Cloudinary URL from the provided media manifest.

36. Never replace a supplied image URL with another URL.

37. Never create a URL based on an image filename.

OUTPUT RULES:

38. Return ONLY valid JSON.

39. Do not use Markdown code fences.

40. Do not include explanations before or after the JSON.

41. The JSON must follow the requested structure exactly.
""";

        /*
         * =========================================================
         * MEDIA MANIFEST
         * =========================================================
         *
         * The manifest gives the AI the allowed media URLs.
         * The actual image pixels are attached separately through
         * OpenCode -f.
         */

        var mediaManifest =
            BuildMediaManifest(
                images,
                mediaLinks);

        /*
         * =========================================================
         * USER PROMPT
         * =========================================================
         */

        var userPrompt = $$"""
{{systemPrompt}}

TRAINING MATERIAL TITLE:

{{materialTitle}}

SOURCE MATERIAL:

{{rawText}}

AVAILABLE MEDIA:

{{mediaManifest}}

The images attached to this request are the actual source images
from the training material.

Inspect the attached images and determine whether any of them
are relevant to the generated learning sections.

When an image is used, copy the exact CloudinaryUrl associated
with its SOURCE_IMAGE identifier into MediaUrl.

When a video is used, copy the exact video URL from AVAILABLE MEDIA.

Organize this source into learning modules and sections.

Return exactly this JSON structure:

{
  "modules": [
    {
      "moduleNumber": 1,
      "title": "Module title",
      "description": "Module description",
      "sections": [
        {
          "sectionNumber": 1,
          "title": "Section title",
          "contentType": "Text",
          "content": "Section lesson content",
          "mediaUrl": null
        }
      ]
    }
  ]
}

IMPORTANT:

- Use only information contained in the source.
- Inspect attached images when relevant.
- Do not invent facts.
- Do not invent media URLs.
- Do not invent YouTube URLs.
- Do not modify media URLs.
- If a media URL exists in the media manifest, preserve it exactly.
- Text sections must use contentType "Text".
- Image sections must use contentType "Image".
- Video sections must use contentType "Video".
- Image sections must use an exact CloudinaryUrl from AVAILABLE MEDIA.
- Video sections must use an exact URL from AVAILABLE MEDIA.
- Return ONLY JSON.
""";

        /*
         * =========================================================
         * IMAGE PATHS
         * =========================================================
         */

        var imagePaths = images
            .Where(x =>
                !string.IsNullOrWhiteSpace(x.LocalPath))
            .Select(x => x.LocalPath)
            .Where(File.Exists)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        /*
         * =========================================================
         * OPEN CODE
         * =========================================================
         */

        string content;

        try
        {
            if (imagePaths.Count > 0)
            {
                content =
                    await _openCodeService.RunWithImagesAsync(
                        userPrompt,
                        imagePaths,
                        cancellationToken);
            }
            else
            {
                content =
                    await _openCodeService.RunAsync(
                        userPrompt,
                        cancellationToken);
            }
        }
        finally
        {
            /*
             * =====================================================
             * CLEAN TEMP IMAGE FILES
             * =====================================================
             */

            CleanupTemporaryImages(
                imagePaths);
        }

        /*
         * =========================================================
         * VALIDATE AI RESPONSE
         * =========================================================
         */

        if (string.IsNullOrWhiteSpace(content))
        {
            throw new InvalidOperationException(
                "OpenCode returned an empty response.");
        }

        content =
            CleanJsonResponse(content);

        AiLearningMaterialResult? result;

        try
        {
            result =
                JsonSerializer.Deserialize<AiLearningMaterialResult>(
                    content,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException(
                $"Unable to parse OpenCode JSON response. Response: {content}",
                ex);
        }

        if (result is null)
        {
            throw new InvalidOperationException(
                "Unable to parse OpenCode response.");
        }

        ValidateResult(
            result);

        ValidateMedia(
            result,
            images,
            mediaLinks);

        return result;
    }

    // ============================================================
    // MEDIA MANIFEST
    // ============================================================

    private static string BuildMediaManifest(
        IReadOnlyList<DocumentImage> images,
        IReadOnlyList<DocumentMediaLink> mediaLinks)
    {
        var builder =
            new StringBuilder();

        if (images.Count == 0 &&
            mediaLinks.Count == 0)
        {
            builder.AppendLine(
                "No media is available.");

            return builder.ToString();
        }

        if (images.Count > 0)
        {
            builder.AppendLine(
                "IMAGES:");

            foreach (var image in images.OrderBy(x => x.Order))
            {
                builder.AppendLine(
                    $"SOURCE_IMAGE_{image.Order}:");

                builder.AppendLine(
                    $"FileName: {image.FileName}");

                builder.AppendLine(
                    $"ContentType: {image.ContentType}");

                builder.AppendLine(
                    $"CloudinaryUrl: {image.Url}");

                builder.AppendLine();
            }
        }

        if (mediaLinks.Count > 0)
        {
            builder.AppendLine(
                "VIDEOS:");

            foreach (
                var mediaLink in mediaLinks.OrderBy(x => x.Order))
            {
                builder.AppendLine(
                    $"VIDEO_{mediaLink.Order}:");

                builder.AppendLine(
                    $"Type: {mediaLink.Type}");

                builder.AppendLine(
                    $"Url: {mediaLink.Url}");

                builder.AppendLine();
            }
        }

        return builder.ToString().Trim();
    }

    // ============================================================
    // MEDIA VALIDATION
    // ============================================================

    private static void ValidateMedia(
        AiLearningMaterialResult result,
        IReadOnlyList<DocumentImage> images,
        IReadOnlyList<DocumentMediaLink> mediaLinks)
    {
        var allowedImageUrls =
            images
                .Select(x => x.Url)
                .Where(x =>
                    !string.IsNullOrWhiteSpace(x))
                .ToHashSet(
                    StringComparer.OrdinalIgnoreCase);

        var allowedVideoUrls =
            mediaLinks
                .Select(x => x.Url)
                .Where(x =>
                    !string.IsNullOrWhiteSpace(x))
                .ToHashSet(
                    StringComparer.OrdinalIgnoreCase);

        foreach (var module in result.Modules)
        {
            foreach (var section in module.Sections)
            {
                var contentType =
                    string.IsNullOrWhiteSpace(
                        section.ContentType)
                        ? "Text"
                        : section.ContentType.Trim();

                /*
                 * =================================================
                 * TEXT
                 * =================================================
                 */

                if (contentType.Equals(
                        "Text",
                        StringComparison.OrdinalIgnoreCase))
                {
                    section.ContentType =
                        "Text";

                    section.MediaUrl =
                        null;

                    continue;
                }

                /*
                 * =================================================
                 * IMAGE
                 * =================================================
                 */

                if (contentType.Equals(
                        "Image",
                        StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrWhiteSpace(
                            section.MediaUrl))
                    {
                        throw new InvalidOperationException(
                            $"Section '{section.Title}' is marked as Image " +
                            "but has no media URL.");
                    }

                    if (!allowedImageUrls.Contains(
                            section.MediaUrl))
                    {
                        throw new InvalidOperationException(
                            $"Section '{section.Title}' contains an image URL " +
                            "that was not supplied by the application.");
                    }

                    section.ContentType =
                        "Image";

                    continue;
                }

                /*
                 * =================================================
                 * VIDEO
                 * =================================================
                 */

                if (contentType.Equals(
                        "Video",
                        StringComparison.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrWhiteSpace(
                            section.MediaUrl))
                    {
                        throw new InvalidOperationException(
                            $"Section '{section.Title}' is marked as Video " +
                            "but has no media URL.");
                    }

                    if (!allowedVideoUrls.Contains(
                            section.MediaUrl))
                    {
                        throw new InvalidOperationException(
                            $"Section '{section.Title}' contains a video URL " +
                            "that was not supplied by the application.");
                    }

                    section.ContentType =
                        "Video";

                    continue;
                }

                throw new InvalidOperationException(
                    $"Section '{section.Title}' has an unsupported " +
                    $"content type: '{section.ContentType}'.");
            }
        }
    }

    // ============================================================
    // JSON CLEANUP
    // ============================================================

    private static string CleanJsonResponse(
        string content)
    {
        content =
            content.Trim();

        if (content.StartsWith("```"))
        {
            var firstNewLine =
                content.IndexOf('\n');

            if (firstNewLine >= 0)
            {
                content =
                    content[(firstNewLine + 1)..];
            }

            if (content.EndsWith("```"))
            {
                content =
                    content[..^3];
            }
        }

        content =
            content.Trim();

        var firstBrace =
            content.IndexOf('{');

        var lastBrace =
            content.LastIndexOf('}');

        if (firstBrace >= 0 &&
            lastBrace >= firstBrace)
        {
            content =
                content[
                    firstBrace..
                    (lastBrace + 1)];
        }

        return content.Trim();
    }

    // ============================================================
    // RESULT VALIDATION
    // ============================================================

    private static void ValidateResult(
        AiLearningMaterialResult result)
    {
        if (result.Modules.Count == 0)
        {
            throw new InvalidOperationException(
                "OpenCode did not generate any learning modules.");
        }

        foreach (var module in result.Modules)
        {
            if (string.IsNullOrWhiteSpace(
                    module.Title))
            {
                throw new InvalidOperationException(
                    "AI generated a module without a title.");
            }

            if (module.Sections.Count == 0)
            {
                throw new InvalidOperationException(
                    $"Module '{module.Title}' has no sections.");
            }

            foreach (var section in module.Sections)
            {
                if (string.IsNullOrWhiteSpace(
                        section.Title))
                {
                    throw new InvalidOperationException(
                        $"Module '{module.Title}' contains a section without a title.");
                }

                if (string.IsNullOrWhiteSpace(
                        section.Content))
                {
                    throw new InvalidOperationException(
                        $"Section '{section.Title}' contains no content.");
                }

                var contentType =
                    string.IsNullOrWhiteSpace(
                        section.ContentType)
                        ? "Text"
                        : section.ContentType.Trim();

                if (!contentType.Equals(
                        "Text",
                        StringComparison.OrdinalIgnoreCase) &&
                    !contentType.Equals(
                        "Image",
                        StringComparison.OrdinalIgnoreCase) &&
                    !contentType.Equals(
                        "Video",
                        StringComparison.OrdinalIgnoreCase))
                {
                    throw new InvalidOperationException(
                        $"Section '{section.Title}' has an unsupported content type: " +
                        $"'{section.ContentType}'.");
                }
            }
        }
    }

    // ============================================================
    // TEMP IMAGE CLEANUP
    // ============================================================

    private static void CleanupTemporaryImages(
        IReadOnlyList<string> imagePaths)
    {
        foreach (var imagePath in imagePaths)
        {
            try
            {
                if (File.Exists(imagePath))
                {
                    File.Delete(imagePath);
                }
            }
            catch
            {
                // Ignore cleanup errors.
            }
        }

        /*
         * Try to remove the generated temporary directory.
         */

        try
        {
            var directories =
                imagePaths
                    .Where(path =>
                        !string.IsNullOrWhiteSpace(path))
                    .Select(Path.GetDirectoryName)
                    .Where(path =>
                        !string.IsNullOrWhiteSpace(path))
                    .Distinct(
                        StringComparer.OrdinalIgnoreCase);

            foreach (var directory in directories)
            {
                if (!Directory.Exists(directory))
                {
                    continue;
                }

                if (!Directory.EnumerateFileSystemEntries(
                        directory)
                    .Any())
                {
                    Directory.Delete(
                        directory);
                }
            }
        }
        catch
        {
            // Ignore cleanup errors.
        }
    }
}