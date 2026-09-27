namespace server.DTOs.Participant.Learning;

public class ParticipantLearningModuleDto
{
    public Guid Id { get; set; }

    public int ModuleNumber { get; set; }

    public string Title { get; set; } = default!;

    public string? Description { get; set; }

    public string? WelcomeContent { get; set; }

    public List<string> LearningObjectives { get; set; } = [];

    public string? Summary { get; set; }

    public List<string> KeyTakeaways { get; set; } = [];

    public List<ParticipantLearningSectionDto> Sections { get; set; } = [];
}