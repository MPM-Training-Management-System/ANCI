namespace server.Services.DocumentExtraction;

public class DocumentTextExtractionResult
{
    public string Text { get; set; } = string.Empty;

    public int PageCount { get; set; }

    public List<DocumentParagraph> Paragraphs { get; set; } = [];

    public List<DocumentTable> Tables { get; set; } = [];

    public List<DocumentImage> Images { get; set; } = [];

    public List<DocumentMediaLink> MediaLinks { get; set; } = [];

    public List<DocumentBlock> Blocks { get; set; } = [];
}

public class DocumentParagraph
{
    public string Text { get; set; } = string.Empty;

    public string Style { get; set; } = string.Empty;
}

public class DocumentTable
{
    public List<DocumentTableRow> Rows { get; set; } = [];
}

public class DocumentTableRow
{
    public List<string> Cells { get; set; } = [];
}

public class DocumentImage
{
    public string FileName { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;

    // Cloudinary URL — ito ang gagamitin ng mobile/database
    public string Url { get; set; } = string.Empty;

    // Temporary local file — ito ang ipapasa sa OpenCode -f
    public string LocalPath { get; set; } = string.Empty;

    public int Order { get; set; }
}

public class DocumentMediaLink
{
    public string Url { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public int Order { get; set; }
}

public class DocumentBlock
{
    public string Type { get; set; } = string.Empty;

    public DocumentParagraph? Paragraph { get; set; }

    public DocumentTable? Table { get; set; }

    public DocumentImage? Image { get; set; }

    public DocumentMediaLink? MediaLink { get; set; }
}