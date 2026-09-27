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

    // ============================================================
    // PDF EXTRACTION
    // ============================================================

    private async Task<DocumentTextExtractionResult>
        ExtractPdfAsync(
            Stream stream,
            string fileName)
    {
        if (stream.CanSeek)
        {
            stream.Position = 0;
        }

        using var memoryStream =
            new MemoryStream();

        await stream.CopyToAsync(memoryStream);

        memoryStream.Position = 0;

        using var document =
            PdfDocument.Open(memoryStream);

        var paragraphs =
            new List<DocumentParagraph>();

        var blocks =
            new List<DocumentBlock>();

        var textParts =
            new List<string>();

        var pageCount =
            document.NumberOfPages;

        foreach (var page in document.GetPages())
        {
            var pageText =
                page.Text?.Trim();

            if (string.IsNullOrWhiteSpace(pageText))
            {
                continue;
            }

            var paragraph =
                new DocumentParagraph
                {
                    Text = pageText,
                    Style = "PDF"
                };

            paragraphs.Add(paragraph);

            blocks.Add(
                new DocumentBlock
                {
                    Type = "Paragraph",
                    Paragraph = paragraph
                });

            textParts.Add(pageText);
        }

        return new DocumentTextExtractionResult
        {
            Text = string.Join(
                Environment.NewLine,
                textParts),

            PageCount = pageCount,

            Paragraphs = paragraphs,

            Tables = [],

            Images = [],

            MediaLinks = [],

            Blocks = blocks
        };
    }

    // ============================================================
    // PPTX EXTRACTION
    // ============================================================

    private async Task<DocumentTextExtractionResult>
        ExtractPptxAsync(
            Stream stream,
            string fileName)
    {
        if (stream.CanSeek)
        {
            stream.Position = 0;
        }

        using var memoryStream =
            new MemoryStream();

        await stream.CopyToAsync(memoryStream);

        memoryStream.Position = 0;

        using var presentation =
            PresentationDocument.Open(
                memoryStream,
                false);

        var presentationPart =
            presentation.PresentationPart;

        if (presentationPart is null)
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

        var blocks =
            new List<DocumentBlock>();

        var textParts =
            new List<string>();

        var slideParts =
            presentationPart
                .SlideParts
                .ToList();

        foreach (var slidePart in slideParts)
        {
            var slideText =
                slidePart
                    .Slide
                    .Descendants<
                        DocumentFormat.OpenXml.Drawing.Text>()
                    .Select(x => x.Text?.Trim())
                    .Where(x =>
                        !string.IsNullOrWhiteSpace(x))
                    .ToList();

            if (slideText.Count == 0)
            {
                continue;
            }

            var combinedSlideText =
                string.Join(
                    " ",
                    slideText);

            var paragraph =
                new DocumentParagraph
                {
                    Text = combinedSlideText,
                    Style = "PPTX"
                };

            paragraphs.Add(paragraph);

            blocks.Add(
                new DocumentBlock
                {
                    Type = "Paragraph",
                    Paragraph = paragraph
                });

            textParts.Add(
                combinedSlideText);
        }

        return new DocumentTextExtractionResult
        {
            Text = string.Join(
                Environment.NewLine,
                textParts),

            PageCount = slideParts.Count,

            Paragraphs = paragraphs,

            Tables = [],

            Images = [],

            MediaLinks = [],

            Blocks = blocks
        };
    }

    // ============================================================
    // DOCX EXTRACTION
    // ============================================================

    private async Task<DocumentTextExtractionResult>
        ExtractDocxAsync(
            Stream stream,
            string fileName)
    {
        if (stream.CanSeek)
        {
            stream.Position = 0;
        }

        using var memoryStream =
            new MemoryStream();

        await stream.CopyToAsync(memoryStream);

        memoryStream.Position = 0;

        using var document =
            WordprocessingDocument.Open(
                memoryStream,
                false);

        var mainPart =
            document.MainDocumentPart;

        if (mainPart is null)
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

        var body =
            mainPart.Document.Body;

        if (body is null)
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

        var tables =
            new List<DocumentTable>();

        var images =
            new List<DocumentImage>();

        var mediaLinks =
            new List<DocumentMediaLink>();

        var blocks =
            new List<DocumentBlock>();

        var textParts =
            new List<string>();

        var imageOutputDirectory =
            Path.Combine(
                Path.GetTempPath(),
                "anci-learning-materials",
                Guid.NewGuid().ToString());

        Directory.CreateDirectory(
            imageOutputDirectory);

        try
        {
            // ----------------------------------------------------
            // PARAGRAPHS
            // ----------------------------------------------------

            foreach (var paragraph
                in body.Descendants<Paragraph>())
            {
                var text =
                    paragraph.InnerText?.Trim();

                if (string.IsNullOrWhiteSpace(text))
                {
                    continue;
                }

                var style =
                    paragraph
                        .ParagraphProperties?
                        .ParagraphStyleId?
                        .Val?
                        .Value
                    ?? string.Empty;

                var documentParagraph =
                    new DocumentParagraph
                    {
                        Text = text,
                        Style = style
                    };

                paragraphs.Add(
                    documentParagraph);

                blocks.Add(
                    new DocumentBlock
                    {
                        Type = "Paragraph",
                        Paragraph = documentParagraph
                    });

                textParts.Add(text);

                ExtractMediaLinks(
                    text,
                    mediaLinks,
                    blocks);
            }

            // ----------------------------------------------------
            // TABLES
            // ----------------------------------------------------

            foreach (var table
                in body.Descendants<Table>())
            {
                var documentTable =
                    new DocumentTable();

                foreach (var row
                    in table.Descendants<TableRow>())
                {
                    var documentRow =
                        new DocumentTableRow();

                    foreach (var cell
                        in row.Descendants<TableCell>())
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

                tables.Add(
                    documentTable);

                blocks.Add(
                    new DocumentBlock
                    {
                        Type = "Table",
                        Table = documentTable
                    });
            }

            // ----------------------------------------------------
            // EMBEDDED IMAGES
            // ----------------------------------------------------

            var drawingElements =
                body
                    .Descendants<
                        DocumentFormat.OpenXml.Drawing.Blip>()
                    .ToList();

            var imageOrder = 0;

            foreach (var blip
                in drawingElements)
            {
                var embedId =
                    blip.Embed?.Value;

                if (string.IsNullOrWhiteSpace(embedId))
                {
                    continue;
                }

                var imagePart =
                    mainPart.GetPartById(
                        embedId) as ImagePart;

                if (imagePart is null)
                {
                    continue;
                }

                imageOrder++;

                var extension =
                    GetImageExtension(
                        imagePart.ContentType);

                var imageFileName =
                    $"image-{imageOrder}{extension}";

                var localPath =
                    Path.Combine(
                        imageOutputDirectory,
                        imageFileName);

                await using (var imageStream =
                    imagePart.GetStream())
                await using (var outputStream =
                    File.Create(localPath))
                {
                    await imageStream.CopyToAsync(
                        outputStream);
                }

                var documentImage =
                    new DocumentImage
                    {
                        FileName =
                            imageFileName,

                        ContentType =
                            imagePart.ContentType,

                        Url = string.Empty,

                        LocalPath =
                            localPath,

                        Order =
                            imageOrder
                    };

                images.Add(
                    documentImage);

                blocks.Add(
                    new DocumentBlock
                    {
                        Type = "Image",
                        Image = documentImage
                    });
            }

            // ----------------------------------------------------
            // RESULT
            // ----------------------------------------------------

            return new DocumentTextExtractionResult
            {
                Text = string.Join(
                    Environment.NewLine,
                    textParts),

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
            TryDeleteDirectory(
                imageOutputDirectory);
        }
    }

    // ============================================================
    // MEDIA LINK EXTRACTION
    // ============================================================

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
                @"https?://[^\s]+",
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

            if (string.IsNullOrWhiteSpace(url))
            {
                continue;
            }

            var type =
                url.Contains(
                    "youtube.com",
                    StringComparison.OrdinalIgnoreCase)
                ||
                url.Contains(
                    "youtu.be",
                    StringComparison.OrdinalIgnoreCase)
                    ? "YouTube"
                    : "Link";

            var mediaLink =
                new DocumentMediaLink
                {
                    Url = url,
                    Type = type,
                    Order =
                        mediaLinks.Count + 1
                };

            mediaLinks.Add(
                mediaLink);

            blocks.Add(
                new DocumentBlock
                {
                    Type = "MediaLink",
                    MediaLink = mediaLink
                });
        }
    }

    // ============================================================
    // IMAGE EXTENSION
    // ============================================================

    private static string GetImageExtension(
        string contentType)
    {
        return contentType.ToLowerInvariant() switch
        {
            "image/png" => ".png",
            "image/jpeg" => ".jpg",
            "image/jpg" => ".jpg",
            "image/gif" => ".gif",
            "image/webp" => ".webp",
            "image/bmp" => ".bmp",
            "image/tiff" => ".tiff",
            "image/svg+xml" => ".svg",
            _ => ".bin"
        };
    }

    // ============================================================
    // TEMP DIRECTORY CLEANUP
    // ============================================================

    private static void TryDeleteDirectory(
        string directoryPath)
    {
        try
        {
            if (Directory.Exists(directoryPath))
            {
                Directory.Delete(
                    directoryPath,
                    recursive: true);
            }
        }
        catch
        {
            // Cleanup failure should not
            // break the extraction process.
        }
    }
}