using server.Services.Interfaces;

namespace server.Services.Training;

public class LearningModuleChunkingService
    : ILearningModuleChunkingService
{
    public List<string> SplitText(
        string text,
        int maxCharacters = 12000,
        int overlapCharacters = 1000)
    {
        if (string.IsNullOrWhiteSpace(text))
            return [];

        if (maxCharacters <= 0)
            throw new ArgumentOutOfRangeException(nameof(maxCharacters));

        if (overlapCharacters < 0 || overlapCharacters >= maxCharacters)
            throw new ArgumentOutOfRangeException(
                nameof(overlapCharacters));

        var chunks = new List<string>();

        var start = 0;

        while (start < text.Length)
        {
            var remaining = text.Length - start;

            if (remaining <= maxCharacters)
            {
                chunks.Add(text[start..]);
                break;
            }

            var length = maxCharacters;

            var candidate = text.Substring(start, length);

            var lastParagraph = candidate.LastIndexOf(
                "\n\n",
                StringComparison.Ordinal);

            if (lastParagraph > maxCharacters / 2)
            {
                length = lastParagraph;
            }
            else
            {
                var lastSentence = candidate.LastIndexOf(
                    ". ",
                    StringComparison.Ordinal);

                if (lastSentence > maxCharacters / 2)
                    length = lastSentence + 1;
            }

            chunks.Add(text.Substring(start, length));

            start += Math.Max(
                1,
                length - overlapCharacters);
        }

        return chunks;
    }
}