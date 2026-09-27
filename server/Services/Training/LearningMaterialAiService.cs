using System.Text.Json;
using server.DTOs.Training.LearningMaterials;
using server.Services.Interfaces;

namespace server.Services.Training;

public class LearningMaterialAiService : ILearningMaterialAiService
{
    private readonly IOpenCodeService _openCodeService;

    public LearningMaterialAiService(
        IOpenCodeService openCodeService)
    {
        _openCodeService = openCodeService;
    }

    // ============================================================
    // GENERATE MODULE CONTENT
    // ============================================================

    public async Task<AiModuleContentResult> GenerateModuleContentAsync(
        string sourceText,
        string moduleTitle,
        string? moduleDescription,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(sourceText))
        {
            throw new InvalidOperationException(
                "Learning material has no extracted text.");
        }

        if (string.IsNullOrWhiteSpace(moduleTitle))
        {
            throw new ArgumentException(
                "Module title is required.",
                nameof(moduleTitle));
        }

        // ========================================================
        // SYSTEM PROMPT
        // ========================================================

        var systemPrompt = """
You are an instructional content assistant.

Your task is to generate learning-support content for
ONE EXISTING TRAINING MODULE.

IMPORTANT:

The module has already been created by the trainer.

You MUST NOT create modules.

You MUST NOT create sections.

You MUST NOT create exams.

You MUST NOT create questions.

You MUST NOT create media.

You MUST NOT assign images.

You MUST NOT assign videos.

You MUST NOT invent information.

Use ONLY information contained in the provided source material.

Preserve the original meaning of the source material.

Do not introduce facts, examples, policies, procedures,
requirements, definitions, or concepts that are not supported
by the source material.

Generate exactly FOUR learning-support contents:

1. Welcome / Introduction
2. Learning Objectives
3. Module Summary
4. Key Takeaways

LEARNING OBJECTIVES:

Generate clear and measurable learning objectives based only
on the source material.

KEY TAKEAWAYS:

Generate the most important points that the learner should
remember after completing the module.

WELCOME:

Write a short and engaging introduction that explains what
the learner will learn in this module.

SUMMARY:

Provide a concise but informative summary of the module.

OUTPUT RULES:

Return ONLY valid JSON.

Do not use Markdown code fences.

Do not include explanations before or after the JSON.

The JSON must follow this exact structure:

{
  "welcome": "...",
  "learningObjectives": [
    "...",
    "...",
    "..."
  ],
  "summary": "...",
  "keyTakeaways": [
    "...",
    "...",
    "..."
  ]
}
""";

        // ========================================================
        // USER PROMPT
        // ========================================================

        var userPrompt = $$"""
{{systemPrompt}}

MODULE TITLE:

{{moduleTitle}}

MODULE DESCRIPTION:

{{moduleDescription ?? "No module description was provided."}}

SOURCE MATERIAL:

{{sourceText}}

Generate learning-support content for this existing module.

Remember:

- Do not create a module.
- Do not create sections.
- Do not create exams.
- Do not create questions.
- Do not create media.
- Do not invent information.
- Use only the provided source material.
- Return ONLY valid JSON.
""";

        // ========================================================
        // CALL OPENCODE
        // ========================================================

        var content = await _openCodeService.RunAsync(
            userPrompt,
            cancellationToken);

        // ========================================================
        // VALIDATE RESPONSE
        // ========================================================

        if (string.IsNullOrWhiteSpace(content))
        {
            throw new InvalidOperationException(
                "OpenCode returned an empty response.");
        }

        content = CleanJsonResponse(content);

        AiModuleContentResult? result;

        try
        {
            result =
                JsonSerializer.Deserialize<AiModuleContentResult>(
                    content,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException(
                $"Unable to parse OpenCode JSON response. Response: {content}",
                ex);
        }

        if (result is null)
        {
            throw new InvalidOperationException(
                "Unable to parse OpenCode response.");
        }

        ValidateResult(result);

        return result;
    }

    // ============================================================
    // JSON CLEANUP
    // ============================================================

    private static string CleanJsonResponse(
        string content)
    {
        content = content.Trim();

        // Remove Markdown code fences if the AI accidentally
        // returns them.

        if (content.StartsWith("```"))
        {
            var firstNewLine =
                content.IndexOf('\n');

            if (firstNewLine >= 0)
            {
                content =
                    content[(firstNewLine + 1)..];
            }

            if (content.EndsWith("```"))
            {
                content =
                    content[..^3];
            }
        }

        content = content.Trim();

        // Find the JSON object if OpenCode added extra text.

        var firstBrace =
            content.IndexOf('{');

        var lastBrace =
            content.LastIndexOf('}');

        if (firstBrace >= 0 &&
            lastBrace >= firstBrace)
        {
            content =
                content[
                    firstBrace..
                    (lastBrace + 1)];
        }

        return content.Trim();
    }

    // ============================================================
    // RESULT VALIDATION
    // ============================================================

    private static void ValidateResult(
        AiModuleContentResult result)
    {
        // Welcome

        if (string.IsNullOrWhiteSpace(
                result.Welcome))
        {
            throw new InvalidOperationException(
                "AI did not generate a Welcome / Introduction.");
        }

        // Learning Objectives

        if (result.LearningObjectives is null ||
            result.LearningObjectives.Count == 0)
        {
            throw new InvalidOperationException(
                "AI did not generate any learning objectives.");
        }

        foreach (var objective in result.LearningObjectives)
        {
            if (string.IsNullOrWhiteSpace(objective))
            {
                throw new InvalidOperationException(
                    "AI generated an empty learning objective.");
            }
        }

        // Summary

        if (string.IsNullOrWhiteSpace(
                result.Summary))
        {
            throw new InvalidOperationException(
                "AI did not generate a module summary.");
        }

        // Key Takeaways

        if (result.KeyTakeaways is null ||
            result.KeyTakeaways.Count == 0)
        {
            throw new InvalidOperationException(
                "AI did not generate any key takeaways.");
        }

        foreach (var takeaway in result.KeyTakeaways)
        {
            if (string.IsNullOrWhiteSpace(takeaway))
            {
                throw new InvalidOperationException(
                    "AI generated an empty key takeaway.");
            }
        }
    }
}