namespace server.Services.Interfaces;

public interface ILearningModuleChunkingService
{
    List<string> SplitText(
        string text,
        int maxCharacters = 12000,
        int overlapCharacters = 1000);
}