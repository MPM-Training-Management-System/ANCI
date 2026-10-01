namespace server.DTOs.Participant.Learning;

public class ParticipantLearningSectionDto
{
    public Guid Id { get; set; }

    public int SectionNumber { get; set; }

    public string Title { get; set; } = default!;

    public string ContentType { get; set; } = default!;

    public string? Content { get; set; }

    public string? MediaUrl { get; set; }

    public int DisplayOrder { get; set; }
}