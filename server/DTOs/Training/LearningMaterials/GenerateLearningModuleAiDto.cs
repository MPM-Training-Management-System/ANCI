namespace server.DTOs.Trainer.Learning;

public class GenerateLearningModuleAiDto
{
    public bool GenerateWelcome { get; set; } = true;

    public bool GenerateLearningObjectives { get; set; } = true;

    public bool GenerateSections { get; set; } = true;

    public bool GenerateSummary { get; set; } = true;

    public bool GenerateKeyTakeaways { get; set; } = true;
}