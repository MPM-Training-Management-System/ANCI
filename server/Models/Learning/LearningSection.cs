namespace server.Models.Learning;

public class LearningSection
{
    public Guid Id { get; set; }

    public Guid LearningModuleId { get; set; }

    public int SectionNumber { get; set; }

    public string Title { get; set; } = default!;

    public string ContentType { get; set; } = "Text";

    public string? Content { get; set; }

    public string? MediaUrl { get; set; }

    public int DisplayOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public LearningModule LearningModule { get; set; } = default!;

    public ICollection<LearningSectionProgress> Progresses { get; set; } = [];
}