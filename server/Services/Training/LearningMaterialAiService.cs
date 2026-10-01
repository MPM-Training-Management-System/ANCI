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
        _openCodeService =
            openCodeService;
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
        if (string.IsNullOrWhiteSpace(
                sourceText))
        {
            throw new InvalidOperationException(
                "No source material is available for this module.");
        }

        if (string.IsNullOrWhiteSpace(
                moduleTitle))
        {
            throw new ArgumentException(
                "Module title is required.",
                nameof(moduleTitle));
        }

        if (images is null)
        {
            throw new ArgumentNullException(
                nameof(images));
        }

        if (mediaLinks is null)
        {
            throw new ArgumentNullException(
                nameof(mediaLinks));
        }

        var imagePaths =
            images
                .Where(
                    image =>
                        !string.IsNullOrWhiteSpace(
                            image.LocalPath))
                .Select(
                    image =>
                        image.LocalPath)
                .Where(
                    File.Exists)
                .Distinct(
                    StringComparer.OrdinalIgnoreCase)
                .ToList();

        var availableImages =
            images
                .Where(
                    image =>
                        !string.IsNullOrWhiteSpace(
                            image.Url))
                .Select(
                    (image, index) =>
                        new SourceImageReference(
                            index + 1,
                            image.Url))
                .ToList();

        var availableMediaLinks =
            mediaLinks
                .Where(
                    link =>
                        !string.IsNullOrWhiteSpace(
                            link.Url))
                .Select(
                    link =>
                        link.Url)
                .Distinct(
                    StringComparer.OrdinalIgnoreCase)
                .ToList();

        var mediaReferenceText =
            BuildMediaReferenceText(
                availableImages,
                availableMediaLinks);

        var systemPrompt = """
You are an instructional content assistant.

You are helping a TRAINER create lesson content for ONE
EXISTING TRAINING MODULE.

IMPORTANT ARCHITECTURE:

TRAINING
    ↓
LEARNING MATERIAL
    ↓
MODULE
    ↓
LESSONS

The TRAINING and LEARNING MATERIAL already exist.

The MODULE already exists.

Your job is ONLY to generate the lessons/content INSIDE
the existing module.

NEVER create another module.

NEVER create another learning material.

NEVER create a training.

NEVER create an assessment.

NEVER create assessment questions.

=========================================================
SOURCE RULES
=========================================================

Use ONLY the provided source material.

Do not use outside knowledge.

Do not invent:

- facts
- definitions
- policies
- procedures
- examples
- statistics
- URLs
- videos
- images

Preserve the meaning of the source.

Follow the logical order of the source.

=========================================================
MODULE RULES
=========================================================

The trainer already created the module.

Module title:

{{MODULE TITLE}}

Module description:

{{MODULE DESCRIPTION}}

Do not rename the module.

Do not create another module.

Generate lesson content that belongs inside this module.

=========================================================
GENERATE
=========================================================

Generate:

1. Welcome / Introduction
2. Learning Objectives
3. Learning Sections / Lessons
4. Module Summary
5. Key Takeaways

=========================================================
LESSON RULES
=========================================================

Create logical lessons based on the actual topics found
in the module source material.

Each lesson must:

- Have a clear title.
- Contain educational content.
- Be based only on the source.
- Follow the logical order.
- Avoid duplicate information.
- Use "Text" as the content type unless a media item
  is directly associated with the lesson.

Do not create unnecessary lessons.

The number of lessons depends on the actual source.

=========================================================
MEDIA RULES
=========================================================

The source may contain:

- Embedded images
- Image URLs
- YouTube URLs

Only use media provided by the system.

Never invent media.

Never search the internet.

Never create URLs.

=========================================================
SOURCE IMAGES
=========================================================

Images are numbered:

IMAGE 1
IMAGE 2
IMAGE 3

Use sourceIndex when an image belongs to a lesson.

sourceIndex is 1-based.

Example:

{
  "type": "Image",
  "sourceIndex": 1,
  "url": "",
  "caption": "..."
}

Never invent sourceIndex.

=========================================================
YOUTUBE
=========================================================

YouTube URLs may be associated with a lesson.

Supported formats:

https://www.youtube.com/watch?v=VIDEO_ID

https://youtu.be/VIDEO_ID

https://www.youtube.com/embed/VIDEO_ID

Use the exact provided URL.

Do not modify it.

Do not invent it.

Do not search for videos.

For YouTube:

"type": "Video"

=========================================================
MEDIA ASSOCIATION
=========================================================

Only associate media with a lesson when the media is
clearly related to that lesson.

If there is no relevant media:

"media": []

=========================================================
CONTENT TYPE
=========================================================

Text lessons must use:

"Text"

Video lessons may use:

"Video"

The backend will validate YouTube URLs.

=========================================================
OUTPUT
=========================================================

Return ONLY valid JSON.

Do not use Markdown.

Use exactly:

{
  "welcome": "...",
  "learningObjectives": [
    "..."
  ],
  "sections": [
    {
      "sectionNumber": 1,
      "title": "...",
      "contentType": "Text",
      "content": "...",
      "media": []
    }
  ],
  "summary": "...",
  "keyTakeaways": [
    "..."
  ]
}
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

Generate the learning lessons for this existing module.

Remember:

- The module already exists.
- Do not create another module.
- Do not create another learning material.
- Generate lessons only.
- Use only the provided source.
- Do not invent information.
- Do not invent URLs.
- Do not search external websites.
- Do not create assessments.
- Do not create assessment questions.
- Use provided images only.
- Use provided YouTube URLs only.
- Associate media only with relevant lessons.
- Return valid JSON only.
""";

        string content;

        if (imagePaths.Count > 0)
        {
            content =
                await _openCodeService
                    .RunWithImagesAsync(
                        userPrompt,
                        imagePaths,
                        cancellationToken);
        }
        else
        {
            content =
                await _openCodeService
                    .RunAsync(
                        userPrompt,
                        cancellationToken);
        }

        if (string.IsNullOrWhiteSpace(
                content))
        {
            throw new InvalidOperationException(
                "OpenCode returned an empty response.");
        }

        content =
            CleanJsonResponse(
                content);

        AiModuleContentResult? result;

        try
        {
            result =
                JsonSerializer.Deserialize<
                    AiModuleContentResult>(
                        content,
                        new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive =
                                true
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

    private static string
        BuildMediaReferenceText(
            IReadOnlyList<SourceImageReference> images,
            IReadOnlyList<string> mediaLinks)
    {
        var lines =
            new List<string>();

        if (images.Count > 0)
        {
            lines.Add(
                "SOURCE IMAGES:");

            foreach (var image in images)
            {
                lines.Add(
                    $"IMAGE {image.Index}: {image.Url}");
            }
        }

        var youtubeLinks =
            mediaLinks
                .Where(
                    IsYouTubeUrl)
                .Distinct(
                    StringComparer.OrdinalIgnoreCase)
                .ToList();

        if (youtubeLinks.Count > 0)
        {
            lines.Add(
                string.Empty);

            lines.Add(
                "YOUTUBE VIDEO URLS:");

            foreach (var youtubeUrl in youtubeLinks)
            {
                lines.Add(
                    youtubeUrl);
            }
        }

        if (lines.Count == 0)
        {
            return
                "MEDIA REFERENCES:\nNo media was detected.";
        }

        return string.Join(
            Environment.NewLine,
            lines);
    }

    private static bool
        IsYouTubeUrl(
            string url)
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

    private static string
        CleanJsonResponse(
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

        content =
            content.Trim();

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

    private static void
        ValidateResult(
            AiModuleContentResult result,
            int sourceImageCount)
    {
        if (string.IsNullOrWhiteSpace(
                result.Welcome))
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
                "AI generated content contains no learning lessons.");
        }

        if (string.IsNullOrWhiteSpace(
                result.Summary))
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
            if (string.IsNullOrWhiteSpace(
                    section.Title))
            {
                throw new InvalidOperationException(
                    $"Lesson {section.SectionNumber} is missing a title.");
            }

            if (string.IsNullOrWhiteSpace(
                    section.Content))
            {
                throw new InvalidOperationException(
                    $"Lesson '{section.Title}' is missing content.");
            }

            if (!string.Equals(
                    section.ContentType,
                    "Text",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    $"Lesson '{section.Title}' must use ContentType 'Text'.");
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

    private static void
        ValidateMedia(
            AiSectionMediaResult media,
            string sectionTitle,
            int sourceImageCount)
    {
        if (string.IsNullOrWhiteSpace(
                media.Type))
        {
            throw new InvalidOperationException(
                $"Lesson '{sectionTitle}' contains media without a type.");
        }

        if (string.Equals(
                media.Type,
                "Image",
                StringComparison.OrdinalIgnoreCase))
        {
            if (media.SourceIndex <= 0)
            {
                if (string.IsNullOrWhiteSpace(
                        media.Url))
                {
                    throw new InvalidOperationException(
                        $"Image media in lesson '{sectionTitle}' " +
                        "must contain either a valid sourceIndex or URL.");
                }
            }
            else if (
                media.SourceIndex >
                sourceImageCount)
            {
                throw new InvalidOperationException(
                    $"Image media in lesson '{sectionTitle}' " +
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
            if (string.IsNullOrWhiteSpace(
                    media.Url))
            {
                throw new InvalidOperationException(
                    $"Video media in lesson '{sectionTitle}' " +
                    "must contain a URL.");
            }

            if (!IsYouTubeUrl(
                    media.Url))
            {
                throw new InvalidOperationException(
                    $"Video media in lesson '{sectionTitle}' " +
                    "must use a valid YouTube URL.");
            }

            return;
        }

        throw new InvalidOperationException(
            $"Unsupported media type '{media.Type}' " +
            $"in lesson '{sectionTitle}'.");
    }
}