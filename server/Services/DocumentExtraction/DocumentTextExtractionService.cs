using System.Text;
using System.Text.RegularExpressions;

using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Presentation;
using DocumentFormat.OpenXml.Wordprocessing;

using server.Services.Interfaces;

using UglyToad.PdfPig;

namespace server.Services.DocumentExtraction;

public class DocumentTextExtractionService
    : IDocumentTextExtractionService
{
    private readonly ICloudinaryService _cloudinaryService;

    public DocumentTextExtractionService(
        ICloudinaryService cloudinaryService)
    {
        _cloudinaryService =
            cloudinaryService
            ?? throw new ArgumentNullException(
                nameof(cloudinaryService));
    }

    public async Task<DocumentTextExtractionResult> ExtractAsync(
        Stream stream,
        string fileName,
        string? contentType)
    {
        if (stream is null)
        {
            throw new ArgumentNullException(nameof(stream));
        }

        if (string.IsNullOrWhiteSpace(fileName))
        {
            throw new ArgumentException(
                "File name is required.",
                nameof(fileName));
        }

        var extension =
            Path.GetExtension(fileName)
                .ToLowerInvariant();

        return extension switch
        {
            ".pdf" => await ExtractPdfAsync(
                stream,
                fileName),

            ".docx" => await ExtractDocxAsync(
                stream,
                fileName),

            ".pptx" => await ExtractPptxAsync(
                stream,
                fileName),

            _ => throw new ArgumentException(
                "Unsupported file type. " +
                "Allowed files are PDF, DOCX, and PPTX.")
        };
    }

    // =========================================================
    // PDF
    // =========================================================

    private async Task<DocumentTextExtractionResult>
        ExtractPdfAsync(
            Stream stream,
            string fileName)
    {
        if (stream.CanSeek)
        {
            stream.Position = 0;
        }

        await using var memoryStream =
            new MemoryStream();

        await stream.CopyToAsync(
            memoryStream);

        memoryStream.Position = 0;

        using var document =
            PdfDocument.Open(memoryStream);

        var paragraphs =
            new List<DocumentParagraph>();

        var blocks =
            new List<DocumentBlock>();

        var mediaLinks =
            new List<DocumentMediaLink>();

        var textBuilder =
            new StringBuilder();

        var pageCount = 0;

        foreach (var page in document.GetPages())
        {
            pageCount++;

            var pageText =
                page.Text?.Trim();

            if (string.IsNullOrWhiteSpace(pageText))
            {
                continue;
            }

            textBuilder.AppendLine(
                pageText);

            textBuilder.AppendLine();

            var paragraph =
                new DocumentParagraph
                {
                    Text = pageText,
                    Style = "PDF"
                };

            paragraphs.Add(
                paragraph);

            blocks.Add(
                new DocumentBlock
                {
                    Type = "Paragraph",
                    Paragraph = paragraph
                });

            ExtractMediaLinks(
                pageText,
                mediaLinks,
                blocks);
        }

        return new DocumentTextExtractionResult
        {
            Text = textBuilder
                .ToString()
                .Trim(),

            PageCount = pageCount,

            Paragraphs = paragraphs,

            Tables = [],

            Images = [],

            MediaLinks = mediaLinks,

            Blocks = blocks
        };
    }

    // =========================================================
    // DOCX
    // =========================================================

    private async Task<DocumentTextExtractionResult>
        ExtractDocxAsync(
            Stream stream,
            string fileName)
    {
        if (stream.CanSeek)
        {
            stream.Position = 0;
        }

        var temporaryDirectory =
            CreateTemporaryDirectory(
                fileName);

        try
        {
            await using var memoryStream =
                new MemoryStream();

            await stream.CopyToAsync(
                memoryStream);

            memoryStream.Position = 0;

            using var document =
                WordprocessingDocument.Open(
                    memoryStream,
                    false);

            var mainPart =
                document.MainDocumentPart;

            if (mainPart is null)
            {
                throw new InvalidOperationException(
                    "The DOCX file does not contain a main document part.");
            }

            var body =
                mainPart.Document?.Body;

            if (body is null)
            {
                throw new InvalidOperationException(
                    "The DOCX file does not contain a document body.");
            }

            var paragraphs =
                new List<DocumentParagraph>();

            var tables =
                new List<DocumentTable>();

            var images =
                new List<DocumentImage>();

            var mediaLinks =
                new List<DocumentMediaLink>();

            var blocks =
                new List<DocumentBlock>();

            var textBuilder =
                new StringBuilder();

            var imageOrder = 0;

            // =================================================
            // BODY ELEMENTS
            // =================================================

            foreach (var element in body.Elements())
            {
                // ---------------------------------------------
                // PARAGRAPH
                // ---------------------------------------------

                if (element is Paragraph paragraph)
                {
                    var paragraphText =
                        paragraph.InnerText?.Trim();

                    if (!string.IsNullOrWhiteSpace(
                            paragraphText))
                    {
                        var documentParagraph =
                            new DocumentParagraph
                            {
                                Text =
                                    paragraphText,

                                Style =
                                    paragraph
                                        .ParagraphProperties?
                                        .ParagraphStyleId?
                                        .Val?
                                        .Value
                                    ?? string.Empty
                            };

                        paragraphs.Add(
                            documentParagraph);

                        blocks.Add(
                            new DocumentBlock
                            {
                                Type = "Paragraph",

                                Paragraph =
                                    documentParagraph
                            });

                        textBuilder.AppendLine(
                            paragraphText);

                        ExtractMediaLinks(
                            paragraphText,
                            mediaLinks,
                            blocks);
                    }

                    // -----------------------------------------
                    // EMBEDDED IMAGES
                    // -----------------------------------------

                    foreach (var blip in
                             paragraph.Descendants<
                                 DocumentFormat
                                     .OpenXml
                                     .Drawing
                                     .Blip>())
                    {
                        var embedId =
                            blip.Embed?.Value;

                        if (string.IsNullOrWhiteSpace(
                                embedId))
                        {
                            continue;
                        }

                        if (mainPart.GetPartById(
                                embedId)
                            is not ImagePart imagePart)
                        {
                            continue;
                        }

                        imageOrder++;

                        var image =
                            await ExtractAndUploadImageAsync(
                                imagePart,
                                temporaryDirectory,
                                $"docx-image-{imageOrder}",
                                imageOrder,
                                fileName);

                        images.Add(
                            image);

                        blocks.Add(
                            new DocumentBlock
                            {
                                Type = "Image",

                                Image = image
                            });
                    }
                }

                // ---------------------------------------------
                // TABLE
                // ---------------------------------------------

                else if (element is Table table)
                {
                    var documentTable =
                        ExtractTable(table);

                    tables.Add(
                        documentTable);

                    blocks.Add(
                        new DocumentBlock
                        {
                            Type = "Table",

                            Table = documentTable
                        });

                    foreach (var row in
                             documentTable.Rows)
                    {
                        foreach (var cell in
                                 row.Cells)
                        {
                            if (!string.IsNullOrWhiteSpace(
                                    cell))
                            {
                                textBuilder.AppendLine(
                                    cell);

                                ExtractMediaLinks(
                                    cell,
                                    mediaLinks,
                                    blocks);
                            }
                        }
                    }
                }
            }

            return new DocumentTextExtractionResult
            {
                Text = textBuilder
                    .ToString()
                    .Trim(),

                PageCount = 0,

                Paragraphs = paragraphs,

                Tables = tables,

                Images = images,

                MediaLinks = mediaLinks,

                Blocks = blocks
            };
        }
        finally
        {
            // Images are already uploaded to Cloudinary.
            // Temporary local files are no longer needed.
            TryDeleteDirectory(
                temporaryDirectory);
        }
    }

    // =========================================================
    // PPTX
    // =========================================================

    private async Task<DocumentTextExtractionResult>
        ExtractPptxAsync(
            Stream stream,
            string fileName)
    {
        if (stream.CanSeek)
        {
            stream.Position = 0;
        }

        var temporaryDirectory =
            CreateTemporaryDirectory(
                fileName);

        try
        {
            await using var memoryStream =
                new MemoryStream();

            await stream.CopyToAsync(
                memoryStream);

            memoryStream.Position = 0;

            using var presentation =
                PresentationDocument.Open(
                    memoryStream,
                    false);

            var presentationPart =
                presentation.PresentationPart;

            if (presentationPart is null)
            {
                throw new InvalidOperationException(
                    "The PPTX file does not contain a presentation part.");
            }

            var slideIdList =
                presentationPart
                    .Presentation?
                    .SlideIdList;

            if (slideIdList is null)
            {
                return new DocumentTextExtractionResult
                {
                    Text = string.Empty,

                    PageCount = 0,

                    Paragraphs = [],

                    Tables = [],

                    Images = [],

                    MediaLinks = [],

                    Blocks = []
                };
            }

            var paragraphs =
                new List<DocumentParagraph>();

            var images =
                new List<DocumentImage>();

            var mediaLinks =
                new List<DocumentMediaLink>();

            var blocks =
                new List<DocumentBlock>();

            var textBuilder =
                new StringBuilder();

            var imageOrder = 0;

            // =================================================
            // SLIDES
            // =================================================

            foreach (var slideId in
                     slideIdList.Elements<SlideId>())
            {
                if (slideId.RelationshipId is null)
                {
                    continue;
                }

                var slidePart =
                    presentationPart.GetPartById(
                        slideId.RelationshipId.Value)
                    as SlidePart;

                if (slidePart is null)
                {
                    continue;
                }

                // ---------------------------------------------
                // SLIDE TEXT
                // ---------------------------------------------

                var slideTextBuilder =
                    new StringBuilder();

                foreach (var text in
                         slidePart
                             .Slide
                             .Descendants<
                                 DocumentFormat
                                     .OpenXml
                                     .Drawing
                                     .Text>())
                {
                    var value =
                        text.Text?.Trim();

                    if (string.IsNullOrWhiteSpace(
                            value))
                    {
                        continue;
                    }

                    slideTextBuilder.AppendLine(
                        value);
                }

                var slideText =
                    slideTextBuilder
                        .ToString()
                        .Trim();

                if (!string.IsNullOrWhiteSpace(
                        slideText))
                {
                    textBuilder.AppendLine(
                        slideText);

                    var paragraph =
                        new DocumentParagraph
                        {
                            Text =
                                slideText,

                            Style =
                                "PPTX"
                        };

                    paragraphs.Add(
                        paragraph);

                    blocks.Add(
                        new DocumentBlock
                        {
                            Type = "Paragraph",

                            Paragraph =
                                paragraph
                        });

                    ExtractMediaLinks(
                        slideText,
                        mediaLinks,
                        blocks);
                }

                // ---------------------------------------------
                // EMBEDDED IMAGES
                // ---------------------------------------------

                foreach (var blip in
                         slidePart
                             .Slide
                             .Descendants<
                                 DocumentFormat
                                     .OpenXml
                                     .Drawing
                                     .Blip>())
                {
                    var embedId =
                        blip.Embed?.Value;

                    if (string.IsNullOrWhiteSpace(
                            embedId))
                    {
                        continue;
                    }

                    if (slidePart.GetPartById(
                            embedId)
                        is not ImagePart imagePart)
                    {
                        continue;
                    }

                    imageOrder++;

                    var image =
                        await ExtractAndUploadImageAsync(
                            imagePart,
                            temporaryDirectory,
                            $"pptx-image-{imageOrder}",
                            imageOrder,
                            fileName);

                    images.Add(
                        image);

                    blocks.Add(
                        new DocumentBlock
                        {
                            Type = "Image",

                            Image = image
                        });
                }
            }

            return new DocumentTextExtractionResult
            {
                Text = textBuilder
                    .ToString()
                    .Trim(),

                PageCount =
                    slideIdList.Count(),

                Paragraphs = paragraphs,

                Tables = [],

                Images = images,

                MediaLinks = mediaLinks,

                Blocks = blocks
            };
        }
        finally
        {
            TryDeleteDirectory(
                temporaryDirectory);
        }
    }

    // =========================================================
    // EXTRACT + UPLOAD IMAGE
    // =========================================================

    private async Task<DocumentImage>
        ExtractAndUploadImageAsync(
            ImagePart imagePart,
            string temporaryDirectory,
            string filePrefix,
            int order,
            string sourceFileName)
    {
        Directory.CreateDirectory(
            temporaryDirectory);

        var contentType =
            imagePart.ContentType;

        var extension =
            GetImageExtension(
                contentType);

        var temporaryFileName =
            $"{filePrefix}-{Guid.NewGuid():N}{extension}";

        var temporaryPath =
            Path.Combine(
                temporaryDirectory,
                temporaryFileName);

        // ---------------------------------------------
        // WRITE EMBEDDED IMAGE TO TEMPORARY FILE
        // ---------------------------------------------

        await using (
            var sourceStream =
                imagePart.GetStream())
        await using (
            var outputStream =
                File.Create(
                    temporaryPath))
        {
            await sourceStream.CopyToAsync(
                outputStream);
        }

        // ---------------------------------------------
        // UPLOAD TO CLOUDINARY
        // ---------------------------------------------

        await using var imageStream =
            File.OpenRead(
                temporaryPath);

        var cloudinaryFileName =
            $"{Path.GetFileNameWithoutExtension(sourceFileName)}-" +
            $"{filePrefix}{extension}";

        var cloudinaryUrl =
            await _cloudinaryService
                .UploadImageAsync(
                    imageStream,
                    cloudinaryFileName,
                    "anci-learning-materials/images");

        // ---------------------------------------------
        // RETURN CLOUDINARY URL
        // ---------------------------------------------

       return new DocumentImage
{
    FileName =
        cloudinaryFileName,

    ContentType =
        contentType,

    Url =
        cloudinaryUrl,

    LocalPath =
        temporaryPath,

    Order =
        order
};
    }

    // =========================================================
    // TABLE
    // =========================================================

    private static DocumentTable
        ExtractTable(
            Table table)
    {
        var documentTable =
            new DocumentTable();

        foreach (var row in
                 table.Elements<TableRow>())
        {
            var documentRow =
                new DocumentTableRow();

            foreach (var cell in
                     row.Elements<TableCell>())
            {
                var cellText =
                    cell.InnerText?.Trim()
                    ?? string.Empty;

                documentRow.Cells.Add(
                    cellText);
            }

            documentTable.Rows.Add(
                documentRow);
        }

        return documentTable;
    }

    // =========================================================
    // MEDIA LINKS
    // =========================================================

    private static void ExtractMediaLinks(
        string text,
        List<DocumentMediaLink> mediaLinks,
        List<DocumentBlock> blocks)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return;
        }

        var matches =
            Regex.Matches(
                text,
                @"https?://[^\s<>""']+",
                RegexOptions.IgnoreCase);

        foreach (Match match in matches)
        {
            var url =
                match.Value.TrimEnd(
                    '.',
                    ',',
                    ';',
                    ':',
                    ')',
                    ']',
                    '}');

            if (string.IsNullOrWhiteSpace(
                    url))
            {
                continue;
            }

            if (mediaLinks.Any(
                    x => string.Equals(
                        x.Url,
                        url,
                        StringComparison.OrdinalIgnoreCase)))
            {
                continue;
            }

            var type =
                IsYouTubeUrl(url)
                    ? "YouTube"
                    : "Link";

            var mediaLink =
                new DocumentMediaLink
                {
                    Url =
                        url,

                    Type =
                        type,

                    Order =
                        mediaLinks.Count + 1
                };

            mediaLinks.Add(
                mediaLink);

            blocks.Add(
                new DocumentBlock
                {
                    Type = "MediaLink",

                    MediaLink =
                        mediaLink
                });
        }
    }

    private static bool IsYouTubeUrl(
        string url)
    {
        if (!Uri.TryCreate(
                url,
                UriKind.Absolute,
                out var uri))
        {
            return false;
        }

        return
            string.Equals(
                uri.Host,
                "youtube.com",
                StringComparison.OrdinalIgnoreCase)
            ||
            string.Equals(
                uri.Host,
                "www.youtube.com",
                StringComparison.OrdinalIgnoreCase)
            ||
            string.Equals(
                uri.Host,
                "youtu.be",
                StringComparison.OrdinalIgnoreCase)
            ||
            string.Equals(
                uri.Host,
                "www.youtu.be",
                StringComparison.OrdinalIgnoreCase);
    }

    // =========================================================
    // TEMPORARY DIRECTORY
    // =========================================================

    private static string
        CreateTemporaryDirectory(
            string fileName)
    {
        var safeFileName =
            Path.GetFileNameWithoutExtension(
                fileName);

        foreach (var invalidCharacter
                 in Path.GetInvalidFileNameChars())
        {
            safeFileName =
                safeFileName.Replace(
                    invalidCharacter,
                    '_');
        }

        var directory =
            Path.Combine(
                Path.GetTempPath(),
                "anci-learning-materials",
                $"{safeFileName}-{Guid.NewGuid():N}");

        Directory.CreateDirectory(
            directory);

        return directory;
    }

    // =========================================================
    // IMAGE EXTENSION
    // =========================================================

    private static string
        GetImageExtension(
            string contentType)
    {
        return contentType
            .ToLowerInvariant() switch
        {
            "image/png" =>
                ".png",

            "image/jpeg" =>
                ".jpg",

            "image/jpg" =>
                ".jpg",

            "image/gif" =>
                ".gif",

            "image/webp" =>
                ".webp",

            "image/bmp" =>
                ".bmp",

            "image/tiff" =>
                ".tiff",

            "image/svg+xml" =>
                ".svg",

            _ =>
                ".bin"
        };
    }

    // =========================================================
    // CLEANUP
    // =========================================================

    private static void
        TryDeleteDirectory(
            string directoryPath)
    {
        try
        {
            if (Directory.Exists(
                    directoryPath))
            {
                Directory.Delete(
                    directoryPath,
                    recursive: true);
            }
        }
        catch
        {
            // Cleanup failure must not break
            // document extraction.
        }
    }
}