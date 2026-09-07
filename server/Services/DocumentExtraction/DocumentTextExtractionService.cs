using System.Text;
using System.Text.RegularExpressions;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using server.Services.Interfaces;

namespace server.Services.DocumentExtraction;

public class DocumentTextExtractionService
    : server.Services.Interfaces.IDocumentTextExtractionService
{
    private readonly ICloudinaryService _cloudinary;

    public DocumentTextExtractionService(
        ICloudinaryService cloudinary)
    {
        _cloudinary = cloudinary;
    }

    // ============================================================
    // PUBLIC ENTRY
    // ============================================================

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

        if (extension != ".docx")
        {
            throw new ArgumentException(
                "Text extraction currently supports DOCX files only.");
        }

        return await ExtractDocxAsync(
            stream,
            fileName);
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

        using var document =
            WordprocessingDocument.Open(
                stream,
                false);

        var mainPart =
            document.MainDocumentPart;

        var body =
            mainPart?
                .Document?
                .Body;

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

        /*
         * =========================================================
         * TEMPORARY DIRECTORY FOR OPENCODE IMAGE INPUT
         * =========================================================
         */

        var tempDirectory =
            Path.Combine(
                Path.GetTempPath(),
                "anc-nextgen",
                "learning-materials",
                Guid.NewGuid().ToString("N"));

        Directory.CreateDirectory(
            tempDirectory);

        try
        {
            /*
             * =====================================================
             * READ DOCUMENT IN ORIGINAL ORDER
             * =====================================================
             */

            foreach (var element in body.Elements())
            {
                /*
                 * =================================================
                 * PARAGRAPH
                 * =================================================
                 */

                if (element is Paragraph paragraph)
                {
                    var paragraphText =
                        paragraph.InnerText?.Trim()
                        ?? string.Empty;

                    var style =
                        paragraph
                            .ParagraphProperties?
                            .ParagraphStyleId?
                            .Val?
                            .Value
                        ?? string.Empty;

                    /*
                     * -------------------------------------------------
                     * EXTRACT EMBEDDED IMAGES
                     * -------------------------------------------------
                     */

                    if (mainPart is not null)
                    {
                        var drawingBlips =
                            paragraph
                                .Descendants<
                                    DocumentFormat.OpenXml.Drawing.Blip>();

                        foreach (var blip in drawingBlips)
                        {
                            var relationshipId =
                                blip.Embed?.Value;

                            if (string.IsNullOrWhiteSpace(
                                    relationshipId))
                            {
                                continue;
                            }

                            var imagePart =
                                mainPart.GetPartById(
                                    relationshipId)
                                as ImagePart;

                            if (imagePart is null)
                            {
                                continue;
                            }

                            await using var imageStream =
                                imagePart.GetStream();

                            await using var imageMemoryStream =
                                new MemoryStream();

                            await imageStream.CopyToAsync(
                                imageMemoryStream);

                            if (imageMemoryStream.Length == 0)
                            {
                                continue;
                            }

                            imageMemoryStream.Position = 0;

                            var imageExtension =
                                GetImageExtension(
                                    imagePart.ContentType);

                            var imageNumber =
                                images.Count + 1;

                            var imageFileName =
                                $"learning-material-image-{imageNumber}{imageExtension}";

                            /*
                             * =================================================
                             * SAVE LOCAL COPY FOR OPENCODE
                             * =================================================
                             */

                            var localImagePath =
                                Path.Combine(
                                    tempDirectory,
                                    imageFileName);

                            imageMemoryStream.Position = 0;

                            await using (
                                var localFileStream =
                                    new FileStream(
                                        localImagePath,
                                        FileMode.Create,
                                        FileAccess.Write,
                                        FileShare.None,
                                        81920,
                                        useAsync: true))
                            {
                                await imageMemoryStream.CopyToAsync(
                                    localFileStream);
                            }

                            /*
                             * =================================================
                             * UPLOAD SAME IMAGE TO CLOUDINARY
                             * =================================================
                             */

                            imageMemoryStream.Position = 0;

                            var imageUrl =
                                await _cloudinary.UploadImageAsync(
                                    imageMemoryStream,
                                    imageFileName,
                                    "ace-nextgen/learning-materials/images");

                            var documentImage =
                                new DocumentImage
                                {
                                    FileName =
                                        imageFileName,

                                    ContentType =
                                        imagePart.ContentType,

                                    Url =
                                        imageUrl,

                                    LocalPath =
                                        localImagePath,

                                    Order =
                                        imageNumber
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
                    }

                    /*
                     * -------------------------------------------------
                     * DETECT YOUTUBE / VIDEO URLS
                     * -------------------------------------------------
                     */

                    var detectedMediaLinks =
                        ExtractMediaLinks(
                            paragraphText);

                    foreach (var mediaLink in detectedMediaLinks)
                    {
                        mediaLinks.Add(
                            mediaLink);

                        blocks.Add(
                            new DocumentBlock
                            {
                                Type = "Media",
                                MediaLink = mediaLink
                            });
                    }

                    /*
                     * -------------------------------------------------
                     * PARAGRAPH
                     * -------------------------------------------------
                     */

                    if (!string.IsNullOrWhiteSpace(
                            paragraphText))
                    {
                        var documentParagraph =
                            new DocumentParagraph
                            {
                                Text =
                                    paragraphText,

                                Style =
                                    style
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
                    }

                    continue;
                }

                /*
                 * =================================================
                 * TABLE
                 * =================================================
                 */

                if (element is Table table)
                {
                    var documentTable =
                        new DocumentTable();

                    foreach (
                        var row in table.Elements<TableRow>())
                    {
                        var documentRow =
                            new DocumentTableRow();

                        foreach (
                            var cell in row.Elements<TableCell>())
                        {
                            var cellText =
                                string.Join(
                                    Environment.NewLine,
                                    cell
                                        .Descendants<Paragraph>()
                                        .Select(p =>
                                            p.InnerText?.Trim()
                                            ?? string.Empty)
                                        .Where(value =>
                                            !string.IsNullOrWhiteSpace(
                                                value)));

                            documentRow.Cells.Add(
                                cellText);

                            /*
                             * Detect YouTube URLs inside table cells.
                             */

                            var detectedMediaLinks =
                                ExtractMediaLinks(
                                    cellText);

                            foreach (var mediaLink
                                in detectedMediaLinks)
                            {
                                mediaLinks.Add(
                                    mediaLink);

                                blocks.Add(
                                    new DocumentBlock
                                    {
                                        Type = "Media",
                                        MediaLink =
                                            mediaLink
                                    });
                            }
                        }

                        if (documentRow.Cells.Count > 0)
                        {
                            documentTable.Rows.Add(
                                documentRow);
                        }
                    }

                    if (documentTable.Rows.Count > 0)
                    {
                        tables.Add(
                            documentTable);

                        blocks.Add(
                            new DocumentBlock
                            {
                                Type = "Table",
                                Table =
                                    documentTable
                            });
                    }
                }
            }

            /*
             * =========================================================
             * COMBINED TEXT
             * =========================================================
             */

            var textParts =
                new List<string>();

            foreach (var block in blocks)
            {
                if (block.Type == "Paragraph" &&
                    block.Paragraph is not null)
                {
                    textParts.Add(
                        block.Paragraph.Text);
                }

                if (block.Type == "Table" &&
                    block.Table is not null)
                {
                    foreach (
                        var row in block.Table.Rows)
                    {
                        textParts.Add(
                            string.Join(
                                " | ",
                                row.Cells));
                    }
                }

                /*
                 * Media URLs are included in extracted source
                 * so the AI knows which video references exist.
                 */

                if (block.Type == "Media" &&
                    block.MediaLink is not null)
                {
                    textParts.Add(
                        $"[MEDIA_{block.MediaLink.Type.ToUpperInvariant()}] " +
                        block.MediaLink.Url);
                }

                /*
                 * Tell the AI that an actual image exists at this
                 * position in the source.
                 */

                if (block.Type == "Image" &&
                    block.Image is not null)
                {
                    textParts.Add(
                        $"[SOURCE_IMAGE_{block.Image.Order}] " +
                        $"FileName: {block.Image.FileName} " +
                        $"CloudinaryUrl: {block.Image.Url}");
                }
            }

            var combinedText =
                string.Join(
                    Environment.NewLine,
                    textParts);

            /*
             * =========================================================
             * RETURN EXTRACTION
             * =========================================================
             */

            return new DocumentTextExtractionResult
            {
                Text =
                    combinedText,

                PageCount =
                    0,

                Paragraphs =
                    paragraphs,

                Tables =
                    tables,

                Images =
                    images,

                MediaLinks =
                    mediaLinks
                        .GroupBy(x => x.Url)
                        .Select(x => x.First())
                        .ToList(),

                Blocks =
                    blocks
            };
        }
        catch
        {
            /*
             * If extraction fails, remove temporary files.
             */

            TryDeleteDirectory(
                tempDirectory);

            throw;
        }
    }

    // ============================================================
    // MEDIA URL DETECTION
    // ============================================================

    private static List<DocumentMediaLink>
        ExtractMediaLinks(
            string text)
    {
        var results =
            new List<DocumentMediaLink>();

        if (string.IsNullOrWhiteSpace(text))
        {
            return results;
        }

        var matches =
            Regex.Matches(
                text,
                @"https?://(?:www\.)?(?:youtube\.com/watch\?[^\s]+|youtu\.be/[^\s]+)",
                RegexOptions.IgnoreCase);

        foreach (Match match in matches)
        {
            var url =
                match.Value
                    .Trim()
                    .TrimEnd(
                        '.',
                        ',',
                        ';',
                        ')',
                        ']');

            if (string.IsNullOrWhiteSpace(url))
            {
                continue;
            }

            results.Add(
                new DocumentMediaLink
                {
                    Url = url,
                    Type = "Video",
                    Order = results.Count + 1
                });
        }

        return results;
    }

    // ============================================================
    // IMAGE EXTENSION
    // ============================================================

    private static string GetImageExtension(
        string contentType)
    {
        return contentType
            .ToLowerInvariant()
            switch
        {
            "image/png" => ".png",
            "image/jpeg" => ".jpg",
            "image/jpg" => ".jpg",
            "image/webp" => ".webp",
            "image/gif" => ".gif",
            "image/bmp" => ".bmp",
            "image/tiff" => ".tiff",
            _ => ".png"
        };
    }

    // ============================================================
    // TEMP DIRECTORY CLEANUP
    // ============================================================

    private static void TryDeleteDirectory(
        string directory)
    {
        try
        {
            if (Directory.Exists(directory))
            {
                Directory.Delete(
                    directory,
                    recursive: true);
            }
        }
        catch
        {
            // Ignore cleanup errors.
        }
    }
}