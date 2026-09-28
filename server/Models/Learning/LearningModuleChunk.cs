namespace server.Models.Learning;

public class LearningModuleChunk
{
    public Guid Id { get; set; }

    public Guid LearningModuleId { get; set; }

    public Guid LearningModuleFileId { get; set; }

    public int ChunkNumber { get; set; }

    public string Content { get; set; } = default!;

    public int CharacterCount { get; set; }

    public DateTime CreatedAt { get; set; }

    // Relationships
    public LearningModule LearningModule { get; set; } = default!;

    public LearningModuleFile LearningModuleFile { get; set; } = default!;
}