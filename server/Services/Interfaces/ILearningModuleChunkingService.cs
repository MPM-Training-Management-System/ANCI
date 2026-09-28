using server.Models.Learning;

namespace server.Services.Interfaces;

public interface ILearningModuleChunkingService
{
    Task<List<LearningModuleChunk>> CreateChunksAsync(
        Guid learningModuleId,
        Guid learningModuleFileId,
        string text);
}