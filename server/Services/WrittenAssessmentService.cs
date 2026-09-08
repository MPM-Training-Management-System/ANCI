using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Assessments;
using server.Models.Assessment;
using server.Models.Participant;
using server.Models.Training;
using server.Services.DocumentExtraction;
using server.Services.Interfaces;

using EnrollmentModel = server.Models.Participant.Enrollment;

namespace server.Services;

public class WrittenAssessmentService
    : IWrittenAssessmentService
{
    private readonly ApplicationDbContext _db;
    private readonly IAssessmentAiService _assessmentAiService;
   public WrittenAssessmentService(
    ApplicationDbContext db,
    IAssessmentAiService assessmentAiService)
{
    _db = db;
    _assessmentAiService = assessmentAiService;


}


    // ==========================================================
    // ADMIN
    // GET ASSESSMENTS BY BATCH
    // ==========================================================

    public async Task<IReadOnlyList<WrittenAssessmentDto>>
        GetByBatchIdAsync(
            Guid trainingBatchId)
    {
        var assessments =
            await _db.WrittenAssessments
                .AsNoTracking()
                .Include(x => x.TrainingBatch)
                .Include(x => x.Questions)
                .Where(x =>
                    x.TrainingBatchId ==
                    trainingBatchId)
                .OrderByDescending(
                    x => x.CreatedAt)
                .ToListAsync();

        return assessments
            .Select(MapAssessment)
            .ToList();
    }


    // ==========================================================
    // ADMIN
    // GET ASSESSMENT BY ID
    // ==========================================================

    public async Task<WrittenAssessmentDto?>
        GetByIdAsync(
            Guid id)
    {
        var assessment =
            await _db.WrittenAssessments
                .AsNoTracking()
                .Include(x => x.TrainingBatch)
                .Include(x => x.Questions)
                .FirstOrDefaultAsync(
                    x => x.Id == id);

        if (assessment is null)
        {
            return null;
        }

        return MapAssessment(
            assessment);
    }


    // ==========================================================
    // ADMIN
    // CREATE ASSESSMENT
    // ==========================================================

    public async Task<WrittenAssessmentDto>
        CreateAsync(
            CreateWrittenAssessmentRequest request)
    {
        ValidateAssessmentRequest(
            request.Title,
            request.PassingPercentage);

        var batch =
            await _db.TrainingBatches
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        request.TrainingBatchId);

        if (batch is null)
        {
            throw new KeyNotFoundException(
                "Training batch not found.");
        }

        var existingAssessment =
            await _db.WrittenAssessments
                .AnyAsync(
                    x =>
                        x.TrainingBatchId ==
                            request.TrainingBatchId &&
                        x.Title.ToLower() ==
                            request.Title
                                .Trim()
                                .ToLower());

        if (existingAssessment)
        {
            throw new InvalidOperationException(
                "An assessment with the same title already exists for this training batch.");
        }

        var now =
            DateTime.UtcNow;

        var assessment =
            new WrittenAssessment
            {
                Id = Guid.NewGuid(),

                TrainingBatchId =
                    request.TrainingBatchId,

                Title =
                    request.Title.Trim(),

                Description =
                    NormalizeNullable(
                        request.Description),

                PassingPercentage =
                    request.PassingPercentage,

                IsPublished = false,

                CreatedAt = now,

                UpdatedAt = null,
            };

        _db.WrittenAssessments.Add(
            assessment);

        await _db.SaveChangesAsync();

        await _db.Entry(assessment)
            .Reference(x => x.TrainingBatch)
            .LoadAsync();

        return MapAssessment(
            assessment);
    }


    // ==========================================================
    // ADMIN
    // UPDATE ASSESSMENT
    // ==========================================================

    public async Task<WrittenAssessmentDto>
        UpdateAsync(
            Guid id,
            UpdateWrittenAssessmentRequest request)
    {
        ValidateAssessmentRequest(
            request.Title,
            request.PassingPercentage);

        var assessment =
            await _db.WrittenAssessments
                .Include(x => x.TrainingBatch)
                .Include(x => x.Questions)
                .FirstOrDefaultAsync(
                    x => x.Id == id);

        if (assessment is null)
        {
            throw new KeyNotFoundException(
                "Written assessment not found.");
        }

        var duplicate =
            await _db.WrittenAssessments
                .AnyAsync(
                    x =>
                        x.Id != id &&
                        x.TrainingBatchId ==
                            assessment.TrainingBatchId &&
                        x.Title.ToLower() ==
                            request.Title
                                .Trim()
                                .ToLower());

        if (duplicate)
        {
            throw new InvalidOperationException(
                "An assessment with the same title already exists for this training batch.");
        }

        assessment.Title =
            request.Title.Trim();

        assessment.Description =
            NormalizeNullable(
                request.Description);

        assessment.PassingPercentage =
            request.PassingPercentage;

        assessment.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapAssessment(
            assessment);
    }


    // ==========================================================
    // ADMIN
    // DELETE ASSESSMENT
    // ==========================================================

    public async Task DeleteAsync(
        Guid id)
    {
        var assessment =
            await _db.WrittenAssessments
                .FirstOrDefaultAsync(
                    x => x.Id == id);

        if (assessment is null)
        {
            throw new KeyNotFoundException(
                "Written assessment not found.");
        }

        var hasAttempts =
            await _db.AssessmentAttempts
                .AnyAsync(
                    x =>
                        x.WrittenAssessmentId ==
                        id);

        if (hasAttempts)
        {
            throw new InvalidOperationException(
                "This assessment cannot be deleted because participant attempts already exist.");
        }

        _db.WrittenAssessments.Remove(
            assessment);

        await _db.SaveChangesAsync();
    }


    // ==========================================================
    // ADMIN
    // PUBLISH / UNPUBLISH
    // ==========================================================

    public async Task<WrittenAssessmentDto>
        SetPublishedAsync(
            Guid id,
            bool isPublished)
    {
        var assessment =
            await _db.WrittenAssessments
                .Include(x => x.TrainingBatch)
                .Include(x => x.Questions)
                    .ThenInclude(x => x.Choices)
                .FirstOrDefaultAsync(
                    x => x.Id == id);

        if (assessment is null)
        {
            throw new KeyNotFoundException(
                "Written assessment not found.");
        }

        if (isPublished)
        {
            ValidateAssessmentCanBePublished(
                assessment);
        }

        assessment.IsPublished =
            isPublished;

        assessment.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapAssessment(
            assessment);
    }


    // ==========================================================
    // QUESTIONS
    // GET
    // ==========================================================
public async Task<
    IReadOnlyList<AdminAssessmentQuestionDto>>
    GetQuestionsAsync(
        Guid writtenAssessmentId)
{
    var assessment =
        await _db.WrittenAssessments
            .Include(x => x.Questions)
                .ThenInclude(x => x.Choices)
            .FirstOrDefaultAsync(
                x => x.Id == writtenAssessmentId);

    if (assessment is null)
    {
        throw new KeyNotFoundException(
            "Written assessment not found.");
    }

    return assessment.Questions
        .OrderBy(x => x.QuestionNumber)
        .Select(MapQuestionToAdminDto)
        .ToList();
}


// ==========================================================
// QUESTIONS
// AI GENERATION FROM DOCUMENT
// ==========================================================

public async Task<IReadOnlyList<AdminAssessmentQuestionDto>>
GenerateQuestionsFromDocumentAsync(
Guid writtenAssessmentId,
string rawText,
int questionCount,
IReadOnlyList<DocumentImage> images,
IReadOnlyList<DocumentMediaLink> mediaLinks,
CancellationToken cancellationToken = default)
{
// =========================================================
// VALIDATE INPUT
// =========================================================


if (string.IsNullOrWhiteSpace(rawText))
{
    throw new ArgumentException(
        "Source document text is required.",
        nameof(rawText));
}

if (questionCount < 1)
{
    throw new ArgumentException(
        "Question count must be at least 1.",
        nameof(questionCount));
}

if (questionCount > 100)
{
    throw new ArgumentException(
        "Question count must not exceed 100.",
        nameof(questionCount));
}

images ??= [];
mediaLinks ??= [];

// =========================================================
// LOAD ASSESSMENT
// =========================================================

var assessment =
    await _db.WrittenAssessments
        .Include(x => x.Questions)
            .ThenInclude(x => x.Choices)
        .FirstOrDefaultAsync(
            x => x.Id == writtenAssessmentId,
            cancellationToken);

if (assessment is null)
{
    throw new KeyNotFoundException(
        "Written assessment not found.");
}

// =========================================================
// PUBLISHED ASSESSMENT PROTECTION
// =========================================================

if (assessment.IsPublished)
{
    throw new InvalidOperationException(
        "Published assessments cannot be modified.");
}

// =========================================================
// CALL AI
// =========================================================

var aiResult =
    await _assessmentAiService.GenerateQuestionsAsync(
        rawText,
        assessment.Title,
        cancellationToken);

if (aiResult is null)
{
    throw new InvalidOperationException(
        "AI did not return an assessment result.");
}

if (aiResult.Questions is null ||
    aiResult.Questions.Count == 0)
{
    throw new InvalidOperationException(
        "AI did not generate any assessment questions.");
}

// =========================================================
// DETERMINE STARTING QUESTION NUMBER
// =========================================================

var nextQuestionNumber =
    assessment.Questions
        .Select(x => x.QuestionNumber)
        .DefaultIfEmpty(0)
        .Max() + 1;

// =========================================================
// SAVE AI GENERATED QUESTIONS
// =========================================================

foreach (var aiQuestion in aiResult.Questions.Take(questionCount))
{
    if (string.IsNullOrWhiteSpace(
            aiQuestion.QuestionText))
    {
        continue;
    }

    var question =
        new AssessmentQuestion
        {
            Id = Guid.NewGuid(),

            WrittenAssessmentId =
                writtenAssessmentId,

            QuestionNumber =
                nextQuestionNumber,

            QuestionText =
                aiQuestion.QuestionText.Trim(),

            Points =
                aiQuestion.Points > 0
                    ? aiQuestion.Points
                    : 1,

            CreatedAt =
                DateTime.UtcNow,

            UpdatedAt = null,

            Choices = []
        };

    // =====================================================
    // SAVE CHOICES
    // =====================================================

    if (aiQuestion.Choices is not null)
    {
        foreach (var aiChoice in
                 aiQuestion.Choices)
        {
            if (string.IsNullOrWhiteSpace(
                    aiChoice.ChoiceText))
            {
                continue;
            }

            var choice =
                new AssessmentChoice
                {
                    Id = Guid.NewGuid(),

                    AssessmentQuestionId =
                        question.Id,

                    ChoiceLabel =
                        string.IsNullOrWhiteSpace(
                            aiChoice.ChoiceLabel)
                            ? GetChoiceLabel(
                                aiQuestion.Choices
                                    .ToList()
                                    .IndexOf(
                                        aiChoice))
                            : aiChoice.ChoiceLabel
                                .Trim()
                                .ToUpperInvariant(),

                    ChoiceText =
                        aiChoice.ChoiceText.Trim(),

                    IsCorrect =
                        aiChoice.IsCorrect,

                    DisplayOrder =
                        aiChoice.DisplayOrder > 0
                            ? aiChoice.DisplayOrder
                            : question
                                .Choices
                                .Count + 1
                };

            question.Choices.Add(
                choice);
        }
    }

    // =====================================================
    // QUESTION VALIDATION
    // =====================================================

    var correctChoiceCount =
        question.Choices.Count(
            x => x.IsCorrect);

    if (question.Choices.Count == 0)
    {
        continue;
    }

    if (correctChoiceCount != 1)
    {
        continue;
    }

    _db.AssessmentQuestions.Add(
        question);

    nextQuestionNumber++;
}

// =========================================================
// CHECK IF ANY QUESTIONS WERE CREATED
// =========================================================

var generatedQuestions =
    _db.ChangeTracker
        .Entries<AssessmentQuestion>()
        .Where(x =>
            x.State ==
                EntityState.Added &&
            x.Entity.WrittenAssessmentId ==
                writtenAssessmentId)
        .Select(x => x.Entity)
        .ToList();

if (generatedQuestions.Count == 0)
{
    throw new InvalidOperationException(
        "No valid assessment questions were generated.");
}

// =========================================================
// SAVE EVERYTHING
// =========================================================

assessment.UpdatedAt =
    DateTime.UtcNow;

await _db.SaveChangesAsync(
    cancellationToken);

// =========================================================
// RETURN SAVED QUESTIONS
// =========================================================

return generatedQuestions
    .OrderBy(x => x.QuestionNumber)
    .Select(MapQuestionToAdminDto)
    .ToList();


}

    // ==========================================================
    // QUESTIONS
    // CREATE
    // ==========================================================

    public async Task<AdminAssessmentQuestionDto>
        CreateQuestionAsync(
            CreateAssessmentQuestionRequest request)
    {
        ValidateQuestionRequest(
            request.QuestionNumber,
            request.QuestionText,
            request.Points);

        var assessment =
            await _db.WrittenAssessments
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        request.WrittenAssessmentId);

        if (assessment is null)
        {
            throw new KeyNotFoundException(
                "Written assessment not found.");
        }

        if (assessment.IsPublished)
        {
            throw new InvalidOperationException(
                "Published assessments cannot be modified.");
        }

        var duplicate =
            await _db.AssessmentQuestions
                .AnyAsync(
                    x =>
                        x.WrittenAssessmentId ==
                            request.WrittenAssessmentId &&
                        x.QuestionNumber ==
                            request.QuestionNumber);

        if (duplicate)
        {
            throw new InvalidOperationException(
                "A question with this question number already exists.");
        }

        var question =
            new AssessmentQuestion
            {
                Id = Guid.NewGuid(),

                WrittenAssessmentId =
                    request.WrittenAssessmentId,

                QuestionNumber =
                    request.QuestionNumber,

                QuestionText =
                    request.QuestionText.Trim(),

                Points =
                    request.Points,

                CreatedAt =
                    DateTime.UtcNow,

                UpdatedAt = null,
            };

        _db.AssessmentQuestions.Add(
            question);

        await _db.SaveChangesAsync();

        question.Choices = [];

        return MapQuestionToAdminDto(question);
    }


    // ==========================================================
    // QUESTIONS
    // UPDATE
    // ==========================================================

    public async Task<AdminAssessmentQuestionDto>
        UpdateQuestionAsync(
            Guid questionId,
            UpdateAssessmentQuestionRequest request)
    {
        ValidateQuestionRequest(
            request.QuestionNumber,
            request.QuestionText,
            request.Points);

        var question =
            await _db.AssessmentQuestions
                .Include(x => x.WrittenAssessment)
                .Include(x => x.Choices)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        questionId);

        if (question is null)
        {
            throw new KeyNotFoundException(
                "Assessment question not found.");
        }

        if (question.WrittenAssessment.IsPublished)
        {
            throw new InvalidOperationException(
                "Published assessments cannot be modified.");
        }

        var duplicate =
            await _db.AssessmentQuestions
                .AnyAsync(
                    x =>
                        x.Id != questionId &&
                        x.WrittenAssessmentId ==
                            question.WrittenAssessmentId &&
                        x.QuestionNumber ==
                            request.QuestionNumber);

        if (duplicate)
        {
            throw new InvalidOperationException(
                "A question with this question number already exists.");
        }

        question.QuestionNumber =
            request.QuestionNumber;

        question.QuestionText =
            request.QuestionText.Trim();

        question.Points =
            request.Points;

        question.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapQuestionToAdminDto(question);
    }


    // ==========================================================
    // QUESTIONS
    // DELETE
    // ==========================================================

    public async Task DeleteQuestionAsync(
        Guid questionId)
    {
        var question =
            await _db.AssessmentQuestions
                .Include(x => x.WrittenAssessment)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        questionId);

        if (question is null)
        {
            throw new KeyNotFoundException(
                "Assessment question not found.");
        }

        if (question.WrittenAssessment.IsPublished)
        {
            throw new InvalidOperationException(
                "Published assessments cannot be modified.");
        }

        var hasAnswers =
            await _db.AssessmentAnswers
                .AnyAsync(
                    x =>
                        x.AssessmentQuestionId ==
                        questionId);

        if (hasAnswers)
        {
            throw new InvalidOperationException(
                "This question cannot be deleted because participant answers already exist.");
        }

        _db.AssessmentQuestions.Remove(
            question);

        await _db.SaveChangesAsync();
    }


    // ==========================================================
    // CHOICES
    // CREATE
    // ==========================================================

    public async Task<AdminAssessmentChoiceDto>
        CreateChoiceAsync(
            CreateAssessmentChoiceRequest request)
    {
        ValidateChoiceRequest(
            request.ChoiceLabel,
            request.ChoiceText,
            request.DisplayOrder);

        var question =
            await _db.AssessmentQuestions
                .Include(x => x.WrittenAssessment)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        request.AssessmentQuestionId);

        if (question is null)
        {
            throw new KeyNotFoundException(
                "Assessment question not found.");
        }

        if (question.WrittenAssessment.IsPublished)
        {
            throw new InvalidOperationException(
                "Published assessments cannot be modified.");
        }

        var duplicateOrder =
            await _db.AssessmentChoices
                .AnyAsync(
                    x =>
                        x.AssessmentQuestionId ==
                            request.AssessmentQuestionId &&
                        x.DisplayOrder ==
                            request.DisplayOrder);

        if (duplicateOrder)
        {
            throw new InvalidOperationException(
                "A choice with this display order already exists.");
        }

        var duplicateLabel =
            await _db.AssessmentChoices
                .AnyAsync(
                    x =>
                        x.AssessmentQuestionId ==
                            request.AssessmentQuestionId &&
                        x.ChoiceLabel.ToLower() ==
                            request.ChoiceLabel
                                .Trim()
                                .ToLower());

        if (duplicateLabel)
        {
            throw new InvalidOperationException(
                "A choice with this label already exists.");
        }

        var choice =
            new AssessmentChoice
            {
                Id = Guid.NewGuid(),

                AssessmentQuestionId =
                    request.AssessmentQuestionId,

                ChoiceLabel =
                    request.ChoiceLabel
                        .Trim()
                        .ToUpperInvariant(),

                ChoiceText =
                    request.ChoiceText.Trim(),

                IsCorrect =
                    request.IsCorrect,

                DisplayOrder =
                    request.DisplayOrder,
            };

        _db.AssessmentChoices.Add(
            choice);

        await _db.SaveChangesAsync();

       return MapChoiceToAdminDto(choice);
    }


    // ==========================================================
    // CHOICES
    // UPDATE
    // ==========================================================

    public async Task<AdminAssessmentChoiceDto>
        UpdateChoiceAsync(
            Guid choiceId,
            UpdateAssessmentChoiceRequest request)
    {
        ValidateChoiceRequest(
            request.ChoiceLabel,
            request.ChoiceText,
            request.DisplayOrder);

        var choice =
            await _db.AssessmentChoices
                .Include(x => x.AssessmentQuestion)
                    .ThenInclude(x =>
                        x.WrittenAssessment)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        choiceId);

        if (choice is null)
        {
            throw new KeyNotFoundException(
                "Assessment choice not found.");
        }

        if (
            choice
                .AssessmentQuestion
                .WrittenAssessment
                .IsPublished)
        {
            throw new InvalidOperationException(
                "Published assessments cannot be modified.");
        }

        var duplicateOrder =
            await _db.AssessmentChoices
                .AnyAsync(
                    x =>
                        x.Id != choiceId &&
                        x.AssessmentQuestionId ==
                            choice.AssessmentQuestionId &&
                        x.DisplayOrder ==
                            request.DisplayOrder);

        if (duplicateOrder)
        {
            throw new InvalidOperationException(
                "A choice with this display order already exists.");
        }

        var duplicateLabel =
            await _db.AssessmentChoices
                .AnyAsync(
                    x =>
                        x.Id != choiceId &&
                        x.AssessmentQuestionId ==
                            choice.AssessmentQuestionId &&
                        x.ChoiceLabel.ToLower() ==
                            request.ChoiceLabel
                                .Trim()
                                .ToLower());

        if (duplicateLabel)
        {
            throw new InvalidOperationException(
                "A choice with this label already exists.");
        }

        choice.ChoiceLabel =
            request.ChoiceLabel
                .Trim()
                .ToUpperInvariant();

        choice.ChoiceText =
            request.ChoiceText.Trim();

        choice.IsCorrect =
            request.IsCorrect;

        choice.DisplayOrder =
            request.DisplayOrder;

        await _db.SaveChangesAsync();

        return MapChoiceToAdminDto(choice);
    }


    // ==========================================================
    // CHOICES
    // DELETE
    // ==========================================================

    public async Task DeleteChoiceAsync(
        Guid choiceId)
    {
        var choice =
            await _db.AssessmentChoices
                .Include(x => x.AssessmentQuestion)
                    .ThenInclude(x =>
                        x.WrittenAssessment)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        choiceId);

        if (choice is null)
        {
            throw new KeyNotFoundException(
                "Assessment choice not found.");
        }

        if (
            choice
                .AssessmentQuestion
                .WrittenAssessment
                .IsPublished)
        {
            throw new InvalidOperationException(
                "Published assessments cannot be modified.");
        }

        var hasAnswers =
            await _db.AssessmentAnswers
                .AnyAsync(
                    x =>
                        x.SelectedChoiceId ==
                        choiceId);

        if (hasAnswers)
        {
            throw new InvalidOperationException(
                "This choice cannot be deleted because it has already been used in a participant answer.");
        }

        _db.AssessmentChoices.Remove(
            choice);

        await _db.SaveChangesAsync();
    }


    // ==========================================================
    // PARTICIPANT
    // GET ASSESSMENT
    // ==========================================================

    public async Task<ParticipantAssessmentDto?>
        GetParticipantAssessmentAsync(
            Guid participantUserId,
            Guid writtenAssessmentId)
    {
        var assessment =
            await _db.WrittenAssessments
                .AsNoTracking()
                .Include(x => x.TrainingBatch)
                .Include(x => x.Questions)
                .Include(x => x.Attempts)
                    .ThenInclude(x => x.Result)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        writtenAssessmentId &&
                        x.IsPublished);

        if (assessment is null)
        {
            return null;
        }

        var enrollment =
            await GetApprovedEnrollmentAsync(
                participantUserId,
                assessment.TrainingBatchId);

        if (enrollment is null)
        {
            return null;
        }

        var attempts =
            assessment.Attempts
                .Where(
                    x =>
                        x.EnrollmentId ==
                        enrollment.Id)
                .OrderByDescending(
                    x => x.AttemptNumber)
                .ToList();

        var latestResult =
            attempts
                .Select(x => x.Result)
                .FirstOrDefault(
                    x => x is not null);

        return new ParticipantAssessmentDto
        {
            Id =
                assessment.Id,

            TrainingBatchId =
                assessment.TrainingBatchId,

            BatchCode =
                assessment.TrainingBatch.BatchCode,

            Title =
                assessment.Title,

            Description =
                assessment.Description,

            PassingPercentage =
                assessment.PassingPercentage,

            QuestionCount =
                assessment.Questions.Count,

            IsPublished =
                assessment.IsPublished,

            AttemptCount =
                attempts.Count,

            HasPassed =
                attempts.Any(
                    x =>
                        x.Status ==
                        AssessmentAttemptStatus.Passed),

            LatestPercentage =
                latestResult?.Percentage,
        };
    }


    // ==========================================================
    // PARTICIPANT
    // START ATTEMPT
    // ==========================================================

    public async Task<AssessmentAttemptDto>
        StartAttemptAsync(
            Guid participantUserId,
            Guid writtenAssessmentId)
    {
        var assessment =
            await _db.WrittenAssessments
                .Include(x => x.TrainingBatch)
                .Include(x => x.Questions)
                    .ThenInclude(x => x.Choices)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        writtenAssessmentId);

        if (assessment is null)
        {
            throw new KeyNotFoundException(
                "Written assessment not found.");
        }

        if (!assessment.IsPublished)
        {
            throw new InvalidOperationException(
                "This assessment is not currently published.");
        }

        var enrollment =
            await GetApprovedEnrollmentAsync(
                participantUserId,
                assessment.TrainingBatchId);

        if (enrollment is null)
        {
            throw new UnauthorizedAccessException(
                "You do not have an approved enrollment for this training batch.");
        }

        var previousAttempts =
            await _db.AssessmentAttempts
                .Where(
                    x =>
                        x.WrittenAssessmentId ==
                            writtenAssessmentId &&
                        x.EnrollmentId ==
                            enrollment.Id)
                .OrderByDescending(
                    x => x.AttemptNumber)
                .ToListAsync();

        var passed =
            previousAttempts.Any(
                x =>
                    x.Status ==
                    AssessmentAttemptStatus.Passed);

        if (passed)
        {
            throw new InvalidOperationException(
                "You have already passed this assessment.");
        }

        var activeAttempt =
            previousAttempts.FirstOrDefault(
                x =>
                    x.Status ==
                    AssessmentAttemptStatus.InProgress);

        if (activeAttempt is not null)
        {
            await LoadAttemptQuestionsAsync(
                activeAttempt);

            return MapAttempt(
                activeAttempt);
        }

        var nextAttemptNumber =
            previousAttempts.Count == 0
                ? 1
                : previousAttempts.Max(
                    x => x.AttemptNumber) + 1;

        var attempt =
            new AssessmentAttempt
            {
                Id =
                    Guid.NewGuid(),

                WrittenAssessmentId =
                    writtenAssessmentId,

                EnrollmentId =
                    enrollment.Id,

                AttemptNumber =
                    nextAttemptNumber,

                StartedAt =
                    DateTime.UtcNow,

                SubmittedAt =
                    null,

                Status =
                    AssessmentAttemptStatus.InProgress,
            };

        _db.AssessmentAttempts.Add(
            attempt);

        await _db.SaveChangesAsync();

        await LoadAttemptQuestionsAsync(
            attempt);

        return MapAttempt(
            attempt);
    }


    // ==========================================================
    // PARTICIPANT
    // GET ATTEMPT
    // ==========================================================

    public async Task<AssessmentAttemptDto?>
        GetAttemptAsync(
            Guid participantUserId,
            Guid attemptId)
    {
        var attempt =
            await _db.AssessmentAttempts
                .Include(x => x.WrittenAssessment)
                .Include(x => x.Enrollment)
                    .ThenInclude(x =>
                        x.ParticipantProfile)
                .Include(x => x.Answers)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        attemptId);

        if (attempt is null)
        {
            return null;
        }

        var userId =
            attempt
                .Enrollment
                .ParticipantProfile
                .UserId;

        if (userId != participantUserId)
        {
            throw new UnauthorizedAccessException(
                "You are not authorized to access this assessment attempt.");
        }

        await LoadAttemptQuestionsAsync(
            attempt);

        return MapAttempt(
            attempt);
    }


    // ==========================================================
    // PARTICIPANT
    // SUBMIT ATTEMPT
    // ==========================================================

    public async Task<AssessmentResultDto>
        SubmitAttemptAsync(
            Guid participantUserId,
            SubmitAssessmentRequest request)
    {
        if (request.Answers is null)
        {
            throw new ArgumentException(
                "Assessment answers are required.");
        }

        var attempt =
            await _db.AssessmentAttempts
                .Include(x => x.WrittenAssessment)
                    .ThenInclude(x =>
                        x.Questions)
                            .ThenInclude(x =>
                                x.Choices)
                .Include(x => x.Enrollment)
                    .ThenInclude(x =>
                        x.ParticipantProfile)
                .Include(x => x.Answers)
                .Include(x => x.Result)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        request.AttemptId);

        if (attempt is null)
        {
            throw new KeyNotFoundException(
                "Assessment attempt not found.");
        }

        var ownerUserId =
            attempt
                .Enrollment
                .ParticipantProfile
                .UserId;

        if (ownerUserId != participantUserId)
        {
            throw new UnauthorizedAccessException(
                "You are not authorized to submit this assessment attempt.");
        }

        if (
            attempt.Status !=
            AssessmentAttemptStatus.InProgress)
        {
            if (attempt.Result is not null)
            {
                return MapResult(
                    attempt);
            }

            throw new InvalidOperationException(
                "This assessment attempt has already been submitted.");
        }

        var questions =
            attempt
                .WrittenAssessment
                .Questions
                .OrderBy(
                    x => x.QuestionNumber)
                .ToList();

        if (questions.Count == 0)
        {
            throw new InvalidOperationException(
                "This assessment does not contain any questions.");
        }

        var questionIds =
            questions
                .Select(x => x.Id)
                .ToHashSet();

        var submittedQuestionIds =
            request.Answers
                .Select(x => x.QuestionId)
                .ToList();

        if (
            submittedQuestionIds.Count !=
            submittedQuestionIds.Distinct().Count())
        {
            throw new ArgumentException(
                "Duplicate answers for the same question are not allowed.");
        }

        if (
            submittedQuestionIds.Any(
                x =>
                    !questionIds.Contains(x)))
        {
            throw new ArgumentException(
                "One or more submitted questions do not belong to this assessment.");
        }

        var answerByQuestion =
            request.Answers
                .ToDictionary(
                    x => x.QuestionId);

        var totalPoints =
            questions.Sum(
                x =>
                    x.Points);

        var earnedPoints = 0;

        var correctAnswers = 0;

        foreach (var question in questions)
        {
            answerByQuestion.TryGetValue(
                question.Id,
                out var submittedAnswer);

            Guid? selectedChoiceId =
                submittedAnswer
                    ?.SelectedChoiceId;

            AssessmentChoice? selectedChoice =
                null;

            if (selectedChoiceId.HasValue)
            {
                selectedChoice =
                    question.Choices
                        .FirstOrDefault(
                            x =>
                                x.Id ==
                                selectedChoiceId.Value);

                if (selectedChoice is null)
                {
                    throw new ArgumentException(
                        $"Selected choice does not belong to question {question.QuestionNumber}.");
                }
            }

            var isCorrect =
                selectedChoice?.IsCorrect ??
                false;

            var earned =
                isCorrect
                    ? question.Points
                    : 0;

            if (isCorrect)
            {
                correctAnswers++;
            }

            earnedPoints += earned;

            var existingAnswer =
                attempt.Answers
                    .FirstOrDefault(
                        x =>
                            x.AssessmentQuestionId ==
                            question.Id);

            if (existingAnswer is null)
            {
                existingAnswer =
                    new AssessmentAnswer
                    {
                        Id =
                            Guid.NewGuid(),

                        AssessmentAttemptId =
                            attempt.Id,

                        AssessmentQuestionId =
                            question.Id,

                        SelectedChoiceId =
                            selectedChoiceId,

                        EarnedPoints =
                            earned,

                        IsCorrect =
                            isCorrect,
                    };

                _db.AssessmentAnswers.Add(
                    existingAnswer);

                attempt.Answers.Add(
                    existingAnswer);
            }
            else
            {
                existingAnswer.SelectedChoiceId =
                    selectedChoiceId;

                existingAnswer.EarnedPoints =
                    earned;

                existingAnswer.IsCorrect =
                    isCorrect;
            }
        }

        var percentage =
            totalPoints <= 0
                ? 0m
                : Math.Round(
                    earnedPoints *
                    100m /
                    totalPoints,
                    2);

        var isPassed =
            percentage >=
            attempt
                .WrittenAssessment
                .PassingPercentage;

        var now =
            DateTime.UtcNow;

        attempt.SubmittedAt =
            now;

        attempt.Status =
            isPassed
                ? AssessmentAttemptStatus.Passed
                : AssessmentAttemptStatus.Failed;

        if (attempt.Result is null)
        {
            attempt.Result =
                new AssessmentResult
                {
                    Id =
                        Guid.NewGuid(),

                    AssessmentAttemptId =
                        attempt.Id,

                    TotalQuestions =
                        questions.Count,

                    CorrectAnswers =
                        correctAnswers,

                    TotalPoints =
                        totalPoints,

                    EarnedPoints =
                        earnedPoints,

                    Percentage =
                        percentage,

                    IsPassed =
                        isPassed,

                    EvaluatedAt =
                        now,
                };

            _db.AssessmentResults.Add(
                attempt.Result);
        }
        else
        {
            attempt.Result.TotalQuestions =
                questions.Count;

            attempt.Result.CorrectAnswers =
                correctAnswers;

            attempt.Result.TotalPoints =
                totalPoints;

            attempt.Result.EarnedPoints =
                earnedPoints;

            attempt.Result.Percentage =
                percentage;

            attempt.Result.IsPassed =
                isPassed;

            attempt.Result.EvaluatedAt =
                now;
        }

        await _db.SaveChangesAsync();

        return MapResult(
            attempt);
    }


   public async Task<IReadOnlyList<AssessmentResultDto>>
    GetMyResultsAsync(
        Guid participantUserId,
        Guid writtenAssessmentId)
{
    var batchId =
        await GetBatchIdForAssessmentAsync(
            writtenAssessmentId);

    var enrollment =
        await GetApprovedEnrollmentAsync(
            participantUserId,
            batchId);

    if (enrollment is null)
    {
        throw new UnauthorizedAccessException(
            "You do not have an approved enrollment for this training batch.");
    }

    var attempts =
        await _db.AssessmentAttempts
            .AsNoTracking()
            .Include(x => x.WrittenAssessment)
            .Include(x => x.Result)
            .Where(
                x =>
                    x.WrittenAssessmentId ==
                        writtenAssessmentId &&
                    x.EnrollmentId ==
                        enrollment.Id &&
                    x.Result != null)
            .OrderByDescending(
                x => x.AttemptNumber)
            .ToListAsync();

    return attempts
        .Select(MapResult)
        .ToList();
}

    private async Task<EnrollmentModel?>
        GetApprovedEnrollmentAsync(
            Guid participantUserId,
            Guid trainingBatchId)
    {
        return await _db.Enrollments
            .Include(x =>
                x.ParticipantProfile)
            .Where(
                x =>
                    x.TrainingBatchId ==
                        trainingBatchId &&
                    x.Status ==
                        EnrollmentStatus.Approved &&
                    x.ParticipantProfile.UserId ==
                        participantUserId)
            .FirstOrDefaultAsync();
    }


    // ==========================================================
    // PRIVATE
    // GET BATCH ID
    // ==========================================================

    private async Task<Guid>
        GetBatchIdForAssessmentAsync(
            Guid writtenAssessmentId)
    {
        var batchId =
            await _db.WrittenAssessments
                .Where(
                    x =>
                        x.Id ==
                        writtenAssessmentId)
                .Select(
                    x =>
                        (Guid?)x.TrainingBatchId)
                .FirstOrDefaultAsync();

        if (!batchId.HasValue)
        {
            throw new KeyNotFoundException(
                "Written assessment not found.");
        }

        return batchId.Value;
    }


    // ==========================================================
    // PRIVATE
    // LOAD ATTEMPT QUESTIONS
    // ==========================================================

    private async Task
        LoadAttemptQuestionsAsync(
            AssessmentAttempt attempt)
    {
        await _db.Entry(attempt)
            .Reference(
                x =>
                    x.WrittenAssessment)
            .Query()
            .Include(
                x =>
                    x.Questions)
                .ThenInclude(
                    x =>
                        x.Choices)
            .LoadAsync();
    }


    // ==========================================================
    // PRIVATE
    // VALIDATION
    // ==========================================================

    private static void
        ValidateAssessmentRequest(
            string title,
            int passingPercentage)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new ArgumentException(
                "Assessment title is required.");
        }

        if (title.Trim().Length > 255)
        {
            throw new ArgumentException(
                "Assessment title cannot exceed 255 characters.");
        }

        if (
            passingPercentage < 1 ||
            passingPercentage > 100)
        {
            throw new ArgumentException(
                "Passing percentage must be between 1 and 100.");
        }
    }


    private static void
        ValidateQuestionRequest(
            int questionNumber,
            string questionText,
            int points)
    {
        if (questionNumber <= 0)
        {
            throw new ArgumentException(
                "Question number must be greater than zero.");
        }

        if (string.IsNullOrWhiteSpace(questionText))
        {
            throw new ArgumentException(
                "Question text is required.");
        }

        if (questionText.Trim().Length > 5000)
        {
            throw new ArgumentException(
                "Question text cannot exceed 5000 characters.");
        }

        if (points <= 0)
        {
            throw new ArgumentException(
                "Question points must be greater than zero.");
        }
    }


    private static void
        ValidateChoiceRequest(
            string choiceLabel,
            string choiceText,
            int displayOrder)
    {
        if (string.IsNullOrWhiteSpace(choiceLabel))
        {
            throw new ArgumentException(
                "Choice label is required.");
        }

        if (choiceLabel.Trim().Length > 10)
        {
            throw new ArgumentException(
                "Choice label cannot exceed 10 characters.");
        }

        if (string.IsNullOrWhiteSpace(choiceText))
        {
            throw new ArgumentException(
                "Choice text is required.");
        }

        if (choiceText.Trim().Length > 2000)
        {
            throw new ArgumentException(
                "Choice text cannot exceed 2000 characters.");
        }

        if (displayOrder < 0)
        {
            throw new ArgumentException(
                "Display order cannot be negative.");
        }
    }


    private static void
        ValidateAssessmentCanBePublished(
            WrittenAssessment assessment)
    {
        if (assessment.Questions.Count == 0)
        {
            throw new InvalidOperationException(
                "An assessment must have at least one question before it can be published.");
        }

        foreach (
            var question
            in assessment.Questions)
        {
            if (question.Points <= 0)
            {
                throw new InvalidOperationException(
                    $"Question {question.QuestionNumber} must have at least one point.");
            }

            if (question.Choices.Count < 2)
            {
                throw new InvalidOperationException(
                    $"Question {question.QuestionNumber} must have at least two choices.");
            }

            var correctCount =
                question.Choices.Count(
                    x =>
                        x.IsCorrect);

            if (correctCount != 1)
            {
                throw new InvalidOperationException(
                    $"Question {question.QuestionNumber} must have exactly one correct choice.");
            }
        }
    }


    // ==========================================================
    // PRIVATE
    // NORMALIZE
    // ==========================================================

    private static string?
        NormalizeNullable(
            string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return value.Trim();
    }


    // ==========================================================
    // MAPPING
    // ==========================================================

    private static WrittenAssessmentDto
        MapAssessment(
            WrittenAssessment assessment)
    {
        return new WrittenAssessmentDto
        {
            Id =
                assessment.Id,

            TrainingBatchId =
                assessment.TrainingBatchId,

            BatchCode =
                assessment.TrainingBatch
                    ?.BatchCode
                ?? string.Empty,

            Title =
                assessment.Title,

            Description =
                assessment.Description,

            PassingPercentage =
                assessment.PassingPercentage,

            IsPublished =
                assessment.IsPublished,

            QuestionCount =
                assessment.Questions.Count,

            CreatedAt =
                assessment.CreatedAt,

            UpdatedAt =
                assessment.UpdatedAt,
        };
    }


    private static AssessmentQuestionDto
        MapQuestion(
            AssessmentQuestion question)
    {
        return new AssessmentQuestionDto
        {
            Id =
                question.Id,

            WrittenAssessmentId =
                question.WrittenAssessmentId,

            QuestionNumber =
                question.QuestionNumber,

            QuestionText =
                question.QuestionText,

            Points =
                question.Points,

            Choices =
                question.Choices
                    .OrderBy(
                        x =>
                            x.DisplayOrder)
                    .Select(
                        MapChoice)
                    .ToList(),
        };
    }


    private static AssessmentChoiceDto
        MapChoice(
            AssessmentChoice choice)
    {
        return new AssessmentChoiceDto
        {
            Id =
                choice.Id,

            AssessmentQuestionId =
                choice.AssessmentQuestionId,

            ChoiceLabel =
                choice.ChoiceLabel,

            ChoiceText =
                choice.ChoiceText,

            DisplayOrder =
                choice.DisplayOrder,
        };
    }


    private static AssessmentAttemptDto
        MapAttempt(
            AssessmentAttempt attempt)
    {
        var questions =
            attempt
                .WrittenAssessment
                .Questions
                .OrderBy(
                    x =>
                        x.QuestionNumber)
                .Select(
                    MapQuestion)
                .ToList();

        return new AssessmentAttemptDto
        {
            Id =
                attempt.Id,

            WrittenAssessmentId =
                attempt.WrittenAssessmentId,

            AssessmentTitle =
                attempt
                    .WrittenAssessment
                    .Title,

            AttemptNumber =
                attempt.AttemptNumber,

            StartedAt =
                attempt.StartedAt,

            Status =
                attempt.Status,

            Questions =
                questions,
        };
    }


    private static AssessmentResultDto
        MapResult(
            AssessmentAttempt attempt)
    {
        if (attempt.Result is null)
        {
            throw new InvalidOperationException(
                "Assessment result is not available.");
        }

        return new AssessmentResultDto
        {
            Id =
                attempt.Result.Id,

            AssessmentAttemptId =
                attempt.Id,

            WrittenAssessmentId =
                attempt.WrittenAssessmentId,

            AssessmentTitle =
                attempt
                    .WrittenAssessment
                    .Title,

            AttemptNumber =
                attempt.AttemptNumber,

            TotalQuestions =
                attempt.Result
                    .TotalQuestions,

            CorrectAnswers =
                attempt.Result
                    .CorrectAnswers,

            TotalPoints =
                attempt.Result
                    .TotalPoints,

            EarnedPoints =
                attempt.Result
                    .EarnedPoints,

            Percentage =
                attempt.Result
                    .Percentage,

            IsPassed =
                attempt.Result
                    .IsPassed,

            EvaluatedAt =
                attempt.Result
                    .EvaluatedAt,
        };
    }


    private static AdminAssessmentQuestionDto
    MapQuestionToAdminDto(
        AssessmentQuestion question)
{
    return new AdminAssessmentQuestionDto
    {
        Id = question.Id,

        WrittenAssessmentId =
            question.WrittenAssessmentId,

        QuestionNumber =
            question.QuestionNumber,

        QuestionText =
            question.QuestionText,

        Points =
            question.Points,

        Choices =
            question.Choices
                .OrderBy(x => x.DisplayOrder)
                .Select(MapChoiceToAdminDto)
                .ToList()
    };
}

private static AdminAssessmentChoiceDto
    MapChoiceToAdminDto(
        AssessmentChoice choice)
{
    return new AdminAssessmentChoiceDto
    {
        Id = choice.Id,

        AssessmentQuestionId =
            choice.AssessmentQuestionId,

        ChoiceLabel =
            choice.ChoiceLabel,

        ChoiceText =
            choice.ChoiceText,

        IsCorrect =
            choice.IsCorrect,

        DisplayOrder =
            choice.DisplayOrder
    };
}

private static string GetChoiceLabel(
int index)
{
return index switch
{
0 => "A",
1 => "B",
2 => "C",
3 => "D",
_ => ((char)('A' + index))
.ToString()
};
}
public async Task<IReadOnlyList<ParticipantAssessmentDto>>
    GetParticipantAssessmentsByBatchIdAsync(
        Guid participantUserId,
        Guid trainingBatchId)
{
    var enrollment =
        await GetApprovedEnrollmentAsync(
            participantUserId,
            trainingBatchId);

    if (enrollment is null)
    {
        return [];
    }

    var assessments =
        await _db.WrittenAssessments
            .AsNoTracking()
            .Include(x => x.TrainingBatch)
            .Include(x => x.Questions)
            .Include(x => x.Attempts)
                .ThenInclude(x => x.Result)
            .Where(x =>
                x.TrainingBatchId ==
                    trainingBatchId &&
                x.IsPublished)
            .OrderBy(x => x.CreatedAt)
            .ToListAsync();

    return assessments
        .Select(assessment =>
        {
            var attempts =
                assessment.Attempts
                    .Where(x =>
                        x.EnrollmentId ==
                        enrollment.Id)
                    .OrderByDescending(
                        x => x.AttemptNumber)
                    .ToList();

            var latestResult =
                attempts
                    .Select(x => x.Result)
                    .FirstOrDefault(
                        x => x is not null);

            return new ParticipantAssessmentDto
            {
                Id =
                    assessment.Id,

                TrainingBatchId =
                    assessment.TrainingBatchId,

                BatchCode =
                    assessment.TrainingBatch.BatchCode,

                Title =
                    assessment.Title,

                Description =
                    assessment.Description,

                PassingPercentage =
                    assessment.PassingPercentage,

                QuestionCount =
                    assessment.Questions.Count,

                IsPublished =
                    assessment.IsPublished,

                AttemptCount =
                    attempts.Count,

                HasPassed =
                    attempts.Any(
                        x =>
                            x.Status ==
                            AssessmentAttemptStatus.Passed),

                LatestPercentage =
                    latestResult?.Percentage,
            };
        })
        .ToList();
}
}