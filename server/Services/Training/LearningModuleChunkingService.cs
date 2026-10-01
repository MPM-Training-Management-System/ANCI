using server.Models.Learning;
using server.Services.Interfaces;

namespace server.Services;

public class LearningModuleChunkingService
    : ILearningModuleChunkingService
{
    private const int DefaultChunkSize = 4000;

    private const int DefaultChunkOverlap = 500;

    public Task<List<LearningModuleChunk>> CreateChunksAsync(
        Guid learningModuleId,
        Guid learningModuleFileId,
        string text)
    {
        var chunks = new List<LearningModuleChunk>();

        if (string.IsNullOrWhiteSpace(text))
        {
            return Task.FromResult(chunks);
        }

        var normalizedText = text.Trim();

        var start = 0;

        var chunkNumber = 1;

        while (start < normalizedText.Length)
        {
            var remainingLength =
                normalizedText.Length - start;

            var currentLength =
                Math.Min(
                    DefaultChunkSize,
                    remainingLength);

            var chunkText =
                normalizedText.Substring(
                    start,
                    currentLength);

            chunkText =
                chunkText.Trim();

            if (!string.IsNullOrWhiteSpace(chunkText))
            {
                chunks.Add(
                    new LearningModuleChunk
                    {
                        Id = Guid.NewGuid(),

                        LearningModuleId =
                            learningModuleId,

                        LearningModuleFileId =
                            learningModuleFileId,

                        ChunkNumber =
                            chunkNumber,

                        Content =
                            chunkText,

                        CharacterCount =
                            chunkText.Length,

                        CreatedAt =
                            DateTime.UtcNow
                    });

                chunkNumber++;
            }

            if (start + currentLength >=
                normalizedText.Length)
            {
                break;
            }

            var nextStart =
                start +
                currentLength -
                DefaultChunkOverlap;

            start =
                Math.Max(
                    nextStart,
                    start + 1);
        }

        return Task.FromResult(chunks);
    }
}