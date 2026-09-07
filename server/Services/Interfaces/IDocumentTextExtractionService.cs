using server.Services.DocumentExtraction;

namespace server.Services.Interfaces;

public interface IDocumentTextExtractionService
{
    Task<DocumentTextExtractionResult> ExtractAsync(
        Stream stream,
        string fileName,
        string? contentType);
}