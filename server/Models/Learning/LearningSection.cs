namespace server.Models.Learning;

public class LearningSection
{
    public Guid Id { get; set; }

    public Guid LearningModuleId { get; set; }

    public int SectionNumber { get; set; }

    public string Title { get; set; } = default!;

    /*
     * ContentType examples:
     *
     * Text
     * Image
     * Video
     * Heading
     */
    public string ContentType { get; set; } = "Text";

    /*
     * Main content of the section.
     *
     * For Text:
     *     actual lesson text
     *
     * For Heading:
     *     heading text
     *
     * For Image/Video:
     *     optional description/caption
     */
    public string? Content { get; set; }

    /*
     * Used later for images/videos.
     *
     * Example:
     * Cloudinary image URL
     * Cloudinary video URL
     */
    public string? MediaUrl { get; set; }

    public int DisplayOrder { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    // Relationship
    public LearningModule LearningModule { get; set; } = default!;

    public ICollection<LearningSectionProgress> Progresses { get; set; } = [];
}