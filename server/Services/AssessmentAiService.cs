using System.Text.Json;
using server.DTOs.Assessments;
using server.Services.Interfaces;

namespace server.Services;

public class AssessmentAiService : IAssessmentAiService
{
    private readonly IOpenCodeService _openCodeService;

    public AssessmentAiService(
        IOpenCodeService openCodeService)
    {
        _openCodeService = openCodeService;
    }

    // ==========================================================
    // GENERATE QUESTIONS
    // ==========================================================

    public async Task<AiAssessmentGenerationResult>
        GenerateQuestionsAsync(
            string rawText,
            string assessmentTitle,
            CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(rawText))
        {
            throw new InvalidOperationException(
                "Assessment document has no extracted text.");
        }

        if (string.IsNullOrWhiteSpace(assessmentTitle))
        {
            throw new ArgumentException(
                "Assessment title is required.");
        }

        // ======================================================
        // SYSTEM PROMPT
        // ======================================================

        var systemPrompt = """
You are an assessment question generation assistant.

Your task is to generate written assessment questions
from the provided source document.

IMPORTANT SOURCE RULES:

1. Use ONLY information contained in the provided source.
2. Do NOT invent facts.
3. Do NOT use outside knowledge.
4. Do NOT create answers that are not supported by the source.
5. Preserve the meaning of the source.
6. Questions must be answerable using the source.
7. Every question must have exactly ONE correct answer.
8. Every question must have at least THREE choices.
9. Prefer FOUR choices when the source supports it.
10. Incorrect choices must be plausible but clearly incorrect
    based on the source.
11. Do not create duplicate questions.
12. Do not create duplicate choices within a question.
13. Do not create trick questions unless the source explicitly
    supports the distinction.
14. Do not create questions about information that does not exist
    in the source.
15. Keep questions clear and suitable for a formal training
    assessment.
16. Preserve important terminology from the source.
17. Use different parts of the source when generating questions.
18. Do not generate questions from unrelated information.

QUESTION RULES:
==========================================================
EXISTING QUESTION / MULTIPLE-CHOICE IMPORT RULES
==========================================================

19. The provided source document may already contain assessment
    questions instead of ordinary learning material.

20. If the source contains existing questions, identify and extract
    those questions from the document.

21. If an existing question contains multiple-choice options,
    read and preserve all available choices.

22. If the source explicitly identifies the correct answer
    (for example:
    - "Answer: B"
    - "Correct Answer: B"
    - "Answer Key: B"
    - "Correct: B"
    - "Key: B"
    - an answer key section
    - a clearly marked correct choice),
    use that information to set IsCorrect = true.

23. The correct answer may appear immediately after the question,
    at the end of the document, or in a separate answer key section.
    Match the answer key to the correct question carefully.

24. Do NOT ignore an answer key simply because it is located
    separately from the questions.

25. If the source contains both questions and an answer key,
    combine them into the final question objects.

26. Preserve the original question meaning and wording as much
    as reasonably possible.

27. Preserve the original choices as much as reasonably possible.
    Do not unnecessarily rewrite choices.

28. If the source uses labels such as A, B, C, D, preserve those
    labels.

29. If the source uses another choice-label format, normalize the
    labels to A, B, C, D while preserving the corresponding choice
    text and correct answer.

30. If the source explicitly provides the correct answer,
    DO NOT generate a different correct answer using outside
    knowledge.

31. If an existing question has no identifiable correct answer,
    do not guess the answer unless the answer can be directly
    determined from the provided source.

32. If the correct answer cannot be determined from the source,
    exclude that question rather than inventing an answer.

33. If the source contains existing multiple-choice questions
    with answers, prioritize importing and structuring those
    questions instead of unnecessarily generating new questions.

34. Do not duplicate an existing question when generating
    additional questions from the same source.

35. The final output must still follow the required JSON structure.

OUTPUT STRUCTURE:

{
  "questions": [
    {
      "questionText": "Question here",
      "points": 1,
      "choices": [
        {
          "choiceLabel": "A",
          "choiceText": "Choice A",
          "isCorrect": false,
          "displayOrder": 1
        },
        {
          "choiceLabel": "B",
          "choiceText": "Choice B",
          "isCorrect": true,
          "displayOrder": 2
        },
        {
          "choiceLabel": "C",
          "choiceText": "Choice C",
          "isCorrect": false,
          "displayOrder": 3
        },
        {
          "choiceLabel": "D",
          "choiceText": "Choice D",
          "isCorrect": false,
          "displayOrder": 4
        }
      ]
    }
  ]
}
""";

        // ======================================================
        // USER PROMPT
        // ======================================================

        var userPrompt = $$"""
{{systemPrompt}}

ASSESSMENT TITLE:

{{assessmentTitle}}

SOURCE DOCUMENT:

{{rawText}}

Generate written assessment questions from this source.

Important:

- Use only the source document.
- Do not invent information.
- Generate as many high-quality questions as the source
  reasonably supports.
- Prefer comprehensive coverage of the important topics.
- Every question must have exactly one correct answer.
- Every question must have at least three choices.
- Prefer four choices.
- The correct answer must be supported directly by the source.

Return ONLY the JSON object.
""";

        // ======================================================
        // AI CALL
        // ======================================================

        var response =
            await _openCodeService.RunAsync(
                userPrompt,
                cancellationToken);

        if (string.IsNullOrWhiteSpace(response))
        {
            throw new InvalidOperationException(
                "AI returned an empty assessment result.");
        }

        // ======================================================
        // CLEAN RESPONSE
        // ======================================================

        var json =
            CleanJsonResponse(response);

        // ======================================================
        // DESERIALIZE
        // ======================================================

        AiAssessmentGenerationResult? result;

        try
        {
            result =
                JsonSerializer.Deserialize<
                    AiAssessmentGenerationResult>(
                        json,
                        new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        });
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException(
                "AI returned invalid assessment JSON.",
                ex);
        }

        if (result is null)
        {
            throw new InvalidOperationException(
                "AI assessment result could not be parsed.");
        }

        // ======================================================
        // VALIDATE RESULT
        // ======================================================

        ValidateResult(result);

        return result;
    }

    // ==========================================================
    // CLEAN JSON
    // ==========================================================

    private static string CleanJsonResponse(
        string response)
    {
        var json =
            response.Trim();

        if (json.StartsWith("```"))
        {
            var firstNewLine =
                json.IndexOf('\n');

            if (firstNewLine >= 0)
            {
                json =
                    json[(firstNewLine + 1)..];
            }

            if (json.EndsWith("```"))
            {
                json =
                    json[..^3];
            }

            json =
                json.Trim();
        }

        return json;
    }

    // ==========================================================
    // VALIDATE RESULT
    // ==========================================================

    private static void ValidateResult(
        AiAssessmentGenerationResult result)
    {
        if (result.Questions is null ||
            result.Questions.Count == 0)
        {
            throw new InvalidOperationException(
                "AI did not generate any assessment questions.");
        }

        for (
            var questionIndex = 0;
            questionIndex < result.Questions.Count;
            questionIndex++)
        {
            var question =
                result.Questions[questionIndex];

            if (string.IsNullOrWhiteSpace(
                question.QuestionText))
            {
                throw new InvalidOperationException(
                    $"AI generated an empty question at position {questionIndex + 1}.");
            }

            if (question.Points <= 0)
            {
                throw new InvalidOperationException(
                    $"Question {questionIndex + 1} has invalid points.");
            }

            if (question.Choices is null ||
                question.Choices.Count < 3)
            {
                throw new InvalidOperationException(
                    $"Question {questionIndex + 1} must have at least three choices.");
            }

            var correctChoices =
                question.Choices.Count(
                    x => x.IsCorrect);

            if (correctChoices != 1)
            {
                throw new InvalidOperationException(
                    $"Question {questionIndex + 1} must have exactly one correct choice.");
            }

            var labels =
                question.Choices
                    .Select(
                        x =>
                            x.ChoiceLabel
                                .Trim()
                                .ToUpperInvariant())
                    .ToList();

            if (labels.Count != labels.Distinct().Count())
            {
                throw new InvalidOperationException(
                    $"Question {questionIndex + 1} contains duplicate choice labels.");
            }

            var orders =
                question.Choices
                    .Select(x => x.DisplayOrder)
                    .ToList();

            if (orders.Count != orders.Distinct().Count())
            {
                throw new InvalidOperationException(
                    $"Question {questionIndex + 1} contains duplicate display orders.");
            }

            foreach (
                var choice
                in question.Choices)
            {
                if (string.IsNullOrWhiteSpace(
                    choice.ChoiceText))
                {
                    throw new InvalidOperationException(
                        $"Question {questionIndex + 1} contains an empty choice.");
                }

                if (choice.DisplayOrder <= 0)
                {
                    throw new InvalidOperationException(
                        $"Question {questionIndex + 1} contains an invalid choice order.");
                }
            }
        }
    }
}