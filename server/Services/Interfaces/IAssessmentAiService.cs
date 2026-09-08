using server.DTOs.Assessments;

namespace server.Services.Interfaces;

public interface IAssessmentAiService
{
    Task<AiAssessmentGenerationResult> GenerateQuestionsAsync(
        string rawText,
        string assessmentTitle,
        CancellationToken cancellationToken = default);
}