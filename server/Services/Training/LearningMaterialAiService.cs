using System.Text.Json;

using server.DTOs.Training.LearningMaterials;
using server.Services.DocumentExtraction;
using server.Services.Interfaces;

namespace server.Services.Training;

public class LearningMaterialAiService
    : ILearningMaterialAiService
{
    private readonly IOpenCodeService _openCodeService;

    public LearningMaterialAiService(
        IOpenCodeService openCodeService)
    {
        _openCodeService = openCodeService;
    }

    public async Task<AiModuleContentResult>
        GenerateModuleContentAsync(
            string sourceText,
            string moduleTitle,
            string? moduleDescription,
            IReadOnlyList<DocumentImage> images,
            IReadOnlyList<DocumentMediaLink> mediaLinks,
            CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(sourceText))
        {
            throw new InvalidOperationException(
                "No source material is available for this module.");
        }

        if (string.IsNullOrWhiteSpace(moduleTitle))
        {
            throw new ArgumentException(
                "Module title is required.",
                nameof(moduleTitle));
        }

        if (images is null)
        {
            throw new ArgumentNullException(nameof(images));
        }

        if (mediaLinks is null)
        {
            throw new ArgumentNullException(nameof(mediaLinks));
        }

        var imagePaths =
            images
                .Where(image =>
                    !string.IsNullOrWhiteSpace(image.LocalPath))
                .Select(image => image.LocalPath)
                .Where(File.Exists)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

        var availableImages =
            images
                .Where(image =>
                    !string.IsNullOrWhiteSpace(image.Url))
                .Select(
                    (image, index) =>
                        new SourceImageReference(
                            index + 1,
                            image.Url))
                .ToList();

        var availableMediaLinks =
            mediaLinks
                .Where(link =>
                    !string.IsNullOrWhiteSpace(link.Url))
                .Select(link => link.Url)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

        var mediaReferenceText =
            BuildMediaReferenceText(
                availableImages,
                availableMediaLinks);

        var systemPrompt = """
You are an instructional content assistant.

Your task is to generate learning content for ONE EXISTING TRAINING MODULE.

The trainer has already created the module.

You MUST generate content only for this module.

SOURCE RULES:

- Use ONLY the provided module source material.
- Do not use outside knowledge.
- Do not invent facts.
- Do not invent definitions.
- Do not invent policies.
- Do not invent procedures.
- Do not invent examples that are not supported by the source.
- Preserve the meaning of the source material.
- Follow the logical order of the source material.

MODULE RULES:

- Do not create another module.
- Do not rename the module.
- Do not create exams.
- Do not create assessment questions.
- Do not create information that is not supported by the source.

GENERATE:

1. Welcome / Introduction
2. Learning Objectives
3. Learning Sections
4. Module Summary
5. Key Takeaways

SECTIONS:

Generate logical learning sections based on the actual topics found
in the module source material.

Each section must:

- Have a clear title.
- Contain educational content based only on the source.
- Follow the logical order of the source.
- Avoid duplicate content.
- Not introduce unsupported information.
- Use "Text" as the content type.

Do not create unnecessary sections.

If the source contains three major topics, create approximately
three logical sections.

If the source contains five major topics, create approximately
five logical sections.

The number of sections must depend on the actual source material.

MEDIA RULES:

The source material may contain:

- Embedded source images.
- Image URLs.
- YouTube video URLs.

You MUST only use media that is provided by the system.

DO NOT:

- Invent image URLs.
- Invent video URLs.
- Create media URLs.
- Search for external images.
- Search for external videos.
- Use URLs that were not provided.
- Generate media.

SOURCE IMAGES:

The system may provide embedded images separately from the text.

These images are numbered:

IMAGE 1
IMAGE 2
IMAGE 3
...

When an embedded source image is relevant to a section, reference
that image using its sourceIndex.

For example:

{
  "type": "Image",
  "sourceIndex": 1,
  "url": "",
  "caption": "..."
}

IMPORTANT:

- sourceIndex is 1-based.
- sourceIndex 1 means IMAGE 1.
- sourceIndex 2 means IMAGE 2.
- Do not invent a sourceIndex.
- Only use sourceIndex values that exist in the provided SOURCE IMAGES.
- For an embedded image, the "url" field may be an empty string.
- The backend will resolve the sourceIndex to the actual persistent
  Cloudinary URL.
- Do NOT attempt to create or modify a Cloudinary URL.

If an embedded image is not relevant to any section, do not attach it.

IMAGE URLS:

If an image URL is explicitly present in the source material or
provided media references, it may be associated with the relevant
section.

Use:

"type": "Image"

If the image comes from the numbered SOURCE IMAGES, use sourceIndex.

YOUTUBE VIDEO RULES:

If a YouTube URL is explicitly provided in the source material or
provided media references and it is clearly related to a specific
section, include it in that section's media array.

Use:

"type": "Video"

Supported YouTube URL formats include:

- https://www.youtube.com/watch?v=VIDEO_ID
- https://youtu.be/VIDEO_ID
- https://www.youtube.com/embed/VIDEO_ID

For YouTube videos, return the actual provided YouTube URL in
the "url" field.

Do not invent or modify the YouTube URL.

MEDIA ASSOCIATION:

Associate media with the section that discusses the topic related
to that media.

Do not attach unrelated media to a section.

If a media item cannot be confidently associated with a section,
leave it out.

CAPTIONS:

Create a short caption only when the source material provides enough
information to describe the media.

Do not invent details about an image or video.

If there is not enough information for a caption, use null.

CONTENT TYPE:

All generated sections must use:

"Text"

Media is separate from ContentType.

OUTPUT:

Return ONLY valid JSON.

Do not use Markdown code fences.

Do not include explanations outside the JSON.

Use exactly this structure:

{
  "welcome": "...",
  "learningObjectives": [
    "...",
    "..."
  ],
  "sections": [
    {
      "sectionNumber": 1,
      "title": "...",
      "contentType": "Text",
      "content": "...",
      "media": [
        {
          "type": "Image",
          "sourceIndex": 1,
          "url": "",
          "caption": "..."
        },
        {
          "type": "Video",
          "sourceIndex": 0,
          "url": "https://www.youtube.com/watch?v=...",
          "caption": "..."
        }
      ]
    }
  ],
  "summary": "...",
  "keyTakeaways": [
    "...",
    "..."
  ]
}

If a section has no media, use:

"media": []
""";

        var userPrompt = $$"""
{{systemPrompt}}

MODULE TITLE:

{{moduleTitle}}

MODULE DESCRIPTION:

{{moduleDescription ?? "No module description was provided."}}

MODULE SOURCE MATERIAL:

{{sourceText}}

{{mediaReferenceText}}

Generate the complete learning content for this existing module.

Remember:

- Use only the provided module source.
- Generate logical sections based on the source.
- Do not create another module.
- Do not create exams.
- Do not create questions.
- Do not invent information.
- Do not invent URLs.
- Do not search for external media.
- Only use the provided source images and media links.
- Use sourceIndex for embedded source images.
- sourceIndex starts at 1.
- Do not invent sourceIndex values.
- For embedded images, the url can be an empty string.
- For videos, use the provided YouTube URL.
- Associate media only with the relevant section.
- Use "Image" for images.
- Use "Video" for YouTube videos.
- Use an empty media array when no relevant media exists.
- Return only valid JSON.
""";

        string content;

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

        if (string.IsNullOrWhiteSpace(content))
        {
            throw new InvalidOperationException(
                "OpenCode returned an empty response.");
        }

        content = CleanJsonResponse(content);

        AiModuleContentResult? result;

        try
        {
            result =
                JsonSerializer.Deserialize<AiModuleContentResult>(
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
            result,
            availableImages.Count);

        return result;
    }

    private sealed record SourceImageReference(
        int Index,
        string Url);

    private static string BuildMediaReferenceText(
        IReadOnlyList<SourceImageReference> images,
        IReadOnlyList<string> mediaLinks)
    {
        var lines = new List<string>();

        if (images.Count > 0)
        {
            lines.Add("SOURCE IMAGES:");

            foreach (var image in images)
            {
                lines.Add(
                    $"IMAGE {image.Index}: {image.Url}");
            }
        }

        var youtubeLinks =
            mediaLinks
                .Where(IsYouTubeUrl)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

        if (youtubeLinks.Count > 0)
        {
            lines.Add(string.Empty);
            lines.Add("YOUTUBE VIDEO URLS:");

            foreach (var youtubeUrl in youtubeLinks)
            {
                lines.Add(youtubeUrl);
            }
        }

        if (lines.Count == 0)
        {
            return "MEDIA REFERENCES:\nNo media was detected.";
        }

        return string.Join(
            Environment.NewLine,
            lines);
    }

    private static bool IsYouTubeUrl(string url)
    {
        if (!Uri.TryCreate(
                url,
                UriKind.Absolute,
                out var uri))
        {
            return false;
        }

        var host =
            uri.Host.ToLowerInvariant();

        return host == "youtube.com"
            || host == "www.youtube.com"
            || host == "m.youtube.com"
            || host == "youtu.be"
            || host == "www.youtu.be";
    }

    private static string CleanJsonResponse(
        string content)
    {
        content = content.Trim();

        if (content.StartsWith("```"))
        {
            var firstNewLine =
                content.IndexOf('\n');

            if (firstNewLine >= 0)
            {
                content =
                    content[
                        (firstNewLine + 1)..];
            }

            if (content.EndsWith("```"))
            {
                content =
                    content[
                        ..^3];
            }
        }

        content = content.Trim();

        var jsonStart =
            content.IndexOf('{');

        var jsonEnd =
            content.LastIndexOf('}');

        if (jsonStart >= 0 &&
            jsonEnd > jsonStart)
        {
            content =
                content[
                    jsonStart..(jsonEnd + 1)];
        }

        return content.Trim();
    }

    private static void ValidateResult(
        AiModuleContentResult result,
        int sourceImageCount)
    {
        if (string.IsNullOrWhiteSpace(result.Welcome))
        {
            throw new InvalidOperationException(
                "AI generated content is missing the welcome message.");
        }

        if (result.LearningObjectives is null ||
            result.LearningObjectives.Count == 0)
        {
            throw new InvalidOperationException(
                "AI generated content contains no learning objectives.");
        }

        if (result.Sections is null ||
            result.Sections.Count == 0)
        {
            throw new InvalidOperationException(
                "AI generated content contains no learning sections.");
        }

        if (string.IsNullOrWhiteSpace(result.Summary))
        {
            throw new InvalidOperationException(
                "AI generated content is missing the summary.");
        }

        if (result.KeyTakeaways is null ||
            result.KeyTakeaways.Count == 0)
        {
            throw new InvalidOperationException(
                "AI generated content contains no key takeaways.");
        }

        foreach (var section in result.Sections)
        {
            if (string.IsNullOrWhiteSpace(section.Title))
            {
                throw new InvalidOperationException(
                    $"Section {section.SectionNumber} is missing a title.");
            }

            if (string.IsNullOrWhiteSpace(section.Content))
            {
                throw new InvalidOperationException(
                    $"Section '{section.Title}' is missing content.");
            }

            if (!string.Equals(
                    section.ContentType,
                    "Text",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    $"Section '{section.Title}' must use ContentType 'Text'.");
            }

            if (section.Media is null)
            {
                continue;
            }

            foreach (var media in section.Media)
            {
                ValidateMedia(
                    media,
                    section.Title,
                    sourceImageCount);
            }
        }
    }

    private static void ValidateMedia(
        AiSectionMediaResult media,
        string sectionTitle,
        int sourceImageCount)
    {
        if (string.IsNullOrWhiteSpace(media.Type))
        {
            throw new InvalidOperationException(
                $"Section '{sectionTitle}' contains media without a type.");
        }

        if (string.Equals(
                media.Type,
                "Image",
                StringComparison.OrdinalIgnoreCase))
        {
            if (media.SourceIndex <= 0)
            {
                if (string.IsNullOrWhiteSpace(media.Url))
                {
                    throw new InvalidOperationException(
                        $"Image media in section '{sectionTitle}' " +
                        "must contain either a valid sourceIndex or a URL.");
                }
            }
            else if (media.SourceIndex > sourceImageCount)
            {
                throw new InvalidOperationException(
                    $"Image media in section '{sectionTitle}' " +
                    $"references sourceIndex {media.SourceIndex}, " +
                    $"but only {sourceImageCount} source image(s) exist.");
            }

            return;
        }

        if (string.Equals(
                media.Type,
                "Video",
                StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(media.Url))
            {
                throw new InvalidOperationException(
                    $"Video media in section '{sectionTitle}' " +
                    "must contain a URL.");
            }

            if (!IsYouTubeUrl(media.Url))
            {
                throw new InvalidOperationException(
                    $"Video media in section '{sectionTitle}' " +
                    "must use a valid YouTube URL.");
            }

            return;
        }

        throw new InvalidOperationException(
            $"Unsupported media type '{media.Type}' " +
            $"in section '{sectionTitle}'.");
    }
}