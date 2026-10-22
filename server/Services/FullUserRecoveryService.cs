
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Admin.Recovery;
using server.Interfaces;
using server.Models.Auth;
using server.Services.Interfaces;

namespace server.Services;

public sealed class FullUserRecoveryService : IFullUserRecoveryService
{
    private readonly ApplicationDbContext _targetDb;
    private readonly IConfiguration _configuration;
    private readonly ILogger<FullUserRecoveryService> _logger;
    private readonly ICacheService _cacheService;

    public FullUserRecoveryService(
        ApplicationDbContext targetDb,
        IConfiguration configuration,
        ILogger<FullUserRecoveryService> logger,
        ICacheService cacheService)
    {
        _targetDb = targetDb;
        _configuration = configuration;
        _logger = logger;
        _cacheService = cacheService;
    }

    // =========================================================
    // PREVIEW - USER CODE IS THE SEARCH KEY
    // =========================================================

    public async Task<FullUserRecoveryPreviewDto> PreviewAsync(
        string userCode,
        CancellationToken cancellationToken = default)
    {
        userCode = ValidateUserCode(userCode);

        await using var sourceDb = CreateRecoveryDbContext();

        var sourceUser = await sourceDb.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(
                x => x.UserCode == userCode,
                cancellationToken);

        if (sourceUser is null)
        {
            throw new KeyNotFoundException(
                $"UserCode '{userCode}' was not found in the recovery database.");
        }

        var targetUser = await _targetDb.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(
                x => x.UserCode == userCode,
                cancellationToken);

        var result = new FullUserRecoveryPreviewDto
        {
            UserId = sourceUser.Id,
            UserCode = sourceUser.UserCode,
            Email = sourceUser.Email,
            FullName = BuildUserName(sourceUser),
            UserExistsInRecovery = true,
            UserExistsInProduction = targetUser is not null
        };

        AddSummary(result, "User", 1, targetUser is null ? 0 : 1);

        var sourceProfile = await sourceDb.ParticipantProfiles
            .AsNoTracking()
            .SingleOrDefaultAsync(
                x => x.UserId == sourceUser.Id,
                cancellationToken);

        if (sourceProfile is null)
        {
            result.Warnings.Add(
                "No ParticipantProfile exists in the recovery database.");

            CalculatePreviewTotals(result);
            return result;
        }

        var targetUserId = targetUser?.Id ?? sourceUser.Id;

        var targetProfile = await _targetDb.ParticipantProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.UserId == targetUserId ||
                     x.Id == sourceProfile.Id,
                cancellationToken);

        AddSummary(
            result,
            "ParticipantProfile",
            1,
            targetProfile is null ? 0 : 1);

        var sourceEnrollments = await sourceDb.Enrollments
            .AsNoTracking()
            .Where(x => x.ParticipantProfileId == sourceProfile.Id)
            .ToListAsync(cancellationToken);

        var enrollmentIds = sourceEnrollments.Select(x => x.Id).ToList();

        var existingEnrollmentIds = await _targetDb.Enrollments
            .AsNoTracking()
            .Where(x => enrollmentIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        AddSummary(
            result,
            "Enrollment",
            sourceEnrollments.Count,
            existingEnrollmentIds.Count);

        var batchIds = sourceEnrollments
            .Select(x => x.TrainingBatchId)
            .Distinct()
            .ToList();

        var sourceBatches = await sourceDb.TrainingBatches
            .AsNoTracking()
            .Where(x => batchIds.Contains(x.Id))
            .ToListAsync(cancellationToken);

        var existingBatchIds = await _targetDb.TrainingBatches
            .AsNoTracking()
            .Where(x => batchIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        AddSummary(
            result,
            "TrainingBatch",
            sourceBatches.Count,
            existingBatchIds.Count);

        var writtenAssessments = await sourceDb.WrittenAssessments
            .AsNoTracking()
            .Where(x => batchIds.Contains(x.TrainingBatchId))
            .ToListAsync(cancellationToken);

        var writtenAssessmentIds = writtenAssessments
            .Select(x => x.Id)
            .ToList();

        var existingWrittenIds = await _targetDb.WrittenAssessments
            .AsNoTracking()
            .Where(x => writtenAssessmentIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        AddSummary(
            result,
            "WrittenAssessment",
            writtenAssessments.Count,
            existingWrittenIds.Count);

        var questions = await sourceDb.AssessmentQuestions
            .AsNoTracking()
            .Where(x => writtenAssessmentIds.Contains(x.WrittenAssessmentId))
            .ToListAsync(cancellationToken);

        var questionIds = questions.Select(x => x.Id).ToList();

        var existingQuestionIds = await _targetDb.AssessmentQuestions
            .AsNoTracking()
            .Where(x => questionIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        AddSummary(
            result,
            "AssessmentQuestion",
            questions.Count,
            existingQuestionIds.Count);

        var choices = await sourceDb.AssessmentChoices
            .AsNoTracking()
            .Where(x => questionIds.Contains(x.AssessmentQuestionId))
            .ToListAsync(cancellationToken);

        var choiceIds = choices.Select(x => x.Id).ToList();

        var existingChoiceIds = await _targetDb.AssessmentChoices
            .AsNoTracking()
            .Where(x => choiceIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        AddSummary(
            result,
            "AssessmentChoice",
            choices.Count,
            existingChoiceIds.Count);

        var attempts = await sourceDb.AssessmentAttempts
            .AsNoTracking()
            .Where(x =>
                enrollmentIds.Contains(x.EnrollmentId) &&
                writtenAssessmentIds.Contains(x.WrittenAssessmentId))
            .ToListAsync(cancellationToken);

        var attemptIds = attempts.Select(x => x.Id).ToList();

        var existingAttemptIds = await _targetDb.AssessmentAttempts
            .AsNoTracking()
            .Where(x => attemptIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        AddSummary(
            result,
            "AssessmentAttempt",
            attempts.Count,
            existingAttemptIds.Count);

        var answers = await sourceDb.AssessmentAnswers
            .AsNoTracking()
            .Where(x => attemptIds.Contains(x.AssessmentAttemptId))
            .ToListAsync(cancellationToken);

        var answerIds = answers.Select(x => x.Id).ToList();

        var existingAnswerIds = await _targetDb.AssessmentAnswers
            .AsNoTracking()
            .Where(x => answerIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        AddSummary(
            result,
            "AssessmentAnswer",
            answers.Count,
            existingAnswerIds.Count);

        var assessmentResults = await sourceDb.AssessmentResults
            .AsNoTracking()
            .Where(x => attemptIds.Contains(x.AssessmentAttemptId))
            .ToListAsync(cancellationToken);

        var assessmentResultIds = assessmentResults
            .Select(x => x.Id)
            .ToList();

        var existingAssessmentResultIds = await _targetDb.AssessmentResults
            .AsNoTracking()
            .Where(x => assessmentResultIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        AddSummary(
            result,
            "AssessmentResult",
            assessmentResults.Count,
            existingAssessmentResultIds.Count);

        var retakeRequests = await sourceDb.AssessmentRetakeRequests
            .AsNoTracking()
            .Where(x =>
                x.ParticipantId == sourceProfile.Id &&
                writtenAssessmentIds.Contains(x.WrittenAssessmentId))
            .ToListAsync(cancellationToken);

        var retakeIds = retakeRequests.Select(x => x.Id).ToList();

        var existingRetakeIds = await _targetDb.AssessmentRetakeRequests
            .AsNoTracking()
            .Where(x => retakeIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        AddSummary(
            result,
            "AssessmentRetakeRequest",
            retakeRequests.Count,
            existingRetakeIds.Count);

        var documents = await sourceDb.EnrollmentDocuments
            .AsNoTracking()
            .Where(x => enrollmentIds.Contains(x.EnrollmentId))
            .ToListAsync(cancellationToken);

        var documentIds = documents.Select(x => x.Id).ToList();

        var existingDocumentIds = await _targetDb.EnrollmentDocuments
            .AsNoTracking()
            .Where(x => documentIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        AddSummary(
            result,
            "EnrollmentDocument",
            documents.Count,
            existingDocumentIds.Count);

        var attendance = await sourceDb.AttendanceRecords
            .AsNoTracking()
            .Where(x => enrollmentIds.Contains(x.EnrollmentId))
            .ToListAsync(cancellationToken);

        var attendanceIds = attendance.Select(x => x.Id).ToList();

        var existingAttendanceIds = await _targetDb.AttendanceRecords
            .AsNoTracking()
            .Where(x => attendanceIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        AddSummary(
            result,
            "AttendanceRecord",
            attendance.Count,
            existingAttendanceIds.Count);

        var certificates = await sourceDb.Certificates
            .AsNoTracking()
            .Where(x => enrollmentIds.Contains(x.EnrollmentId))
            .ToListAsync(cancellationToken);

        var certificateIds = certificates.Select(x => x.Id).ToList();

        var existingCertificateIds = await _targetDb.Certificates
            .AsNoTracking()
            .Where(x => certificateIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        AddSummary(
            result,
            "Certificate",
            certificates.Count,
            existingCertificateIds.Count);

        var progress = await sourceDb.LearningSectionProgresses
            .AsNoTracking()
            .Where(x => enrollmentIds.Contains(x.EnrollmentId))
            .ToListAsync(cancellationToken);

        var progressIds = progress.Select(x => x.Id).ToList();

        var existingProgressIds = await _targetDb.LearningSectionProgresses
            .AsNoTracking()
            .Where(x => progressIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        AddSummary(
            result,
            "LearningSectionProgress",
            progress.Count,
            existingProgressIds.Count);

        var practicalResults = await sourceDb.PracticalAssessmentResults
            .AsNoTracking()
            .Where(x => enrollmentIds.Contains(x.EnrollmentId))
            .ToListAsync(cancellationToken);

        var practicalResultIds = practicalResults
            .Select(x => x.Id)
            .ToList();

        var existingPracticalIds = await _targetDb.PracticalAssessmentResults
            .AsNoTracking()
            .Where(x => practicalResultIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        AddSummary(
            result,
            "PracticalAssessmentResult",
            practicalResults.Count,
            existingPracticalIds.Count);

        var criterionScores = await sourceDb.PracticalAssessmentCriterionScores
            .AsNoTracking()
            .Where(x =>
                practicalResultIds.Contains(x.PracticalAssessmentResultId))
            .ToListAsync(cancellationToken);

        var scoreIds = criterionScores.Select(x => x.Id).ToList();

        var existingScoreIds = await _targetDb.PracticalAssessmentCriterionScores
            .AsNoTracking()
            .Where(x => scoreIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        AddSummary(
            result,
            "PracticalAssessmentCriterionScore",
            criterionScores.Count,
            existingScoreIds.Count);

        CalculatePreviewTotals(result);

        result.Warnings.Add(
            "The account is searched by UserCode. Related database records " +
            "still use their configured primary and foreign keys.");

        result.Warnings.Add(
            "TrainingBatch restoration requires its TrainingProgram to exist " +
            "in production.");

        result.Warnings.Add(
            "AttendanceRecord restoration requires its AttendanceSession " +
            "to exist in production.");

        result.Warnings.Add(
            "LearningSectionProgress restoration requires its LearningSection " +
            "to exist in production.");

        result.Warnings.Add(
            "Practical assessment restoration requires its assessment and " +
            "criteria to exist in production.");

        return result;
    }

    // =========================================================
    // RESTORE - SEARCH BY USERCODE
    // =========================================================

    public async Task<FullUserRecoveryResultDto> RestoreAsync(
        string userCode,
        CancellationToken cancellationToken = default)
    {
        userCode = ValidateUserCode(userCode);

        await using var sourceDb = CreateRecoveryDbContext();

        var sourceUser = await sourceDb.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(
                x => x.UserCode == userCode,
                cancellationToken);

        if (sourceUser is null)
        {
            throw new KeyNotFoundException(
                $"UserCode '{userCode}' was not found in the recovery database.");
        }

        var result = new FullUserRecoveryResultDto
        {
            UserId = sourceUser.Id
        };

        await using var transaction =
            await _targetDb.Database.BeginTransactionAsync(
                cancellationToken);

        try
        {
            // 1. FIND OR RESTORE USER BY USERCODE
            var targetUser = await _targetDb.Users
                .FirstOrDefaultAsync(
                    x => x.UserCode == userCode,
                    cancellationToken);

            if (targetUser is null)
            {
                await EnsureUserIdentifiersAreAvailableAsync(
                    sourceUser,
                    cancellationToken);

                targetUser = CloneScalarProperties(sourceUser);

                _targetDb.Users.Add(targetUser);
                await _targetDb.SaveChangesAsync(cancellationToken);

                Restored(result, "User", targetUser.Id);
            }
            else
            {
                // Do not overwrite existing production account data.
                Skipped(result, "User", targetUser.Id);
            }

            // 2. PARTICIPANT PROFILE
            var sourceProfile = await sourceDb.ParticipantProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.UserId == sourceUser.Id,
                    cancellationToken);

            if (sourceProfile is null)
            {
                await transaction.CommitAsync(cancellationToken);

                result.Success = true;
                result.Messages.Add(
                    $"UserCode '{userCode}' was found, but no source " +
                    "ParticipantProfile exists.");

                return result;
            }

            var targetProfile = await _targetDb.ParticipantProfiles
                .FirstOrDefaultAsync(
                    x => x.UserId == targetUser.Id,
                    cancellationToken);

            if (targetProfile is null)
            {
                var profileWithSameId = await _targetDb.ParticipantProfiles
                    .FirstOrDefaultAsync(
                        x => x.Id == sourceProfile.Id,
                        cancellationToken);

                if (profileWithSameId is not null &&
                    profileWithSameId.UserId != targetUser.Id)
                {
                    throw new InvalidOperationException(
                        $"Cannot restore UserCode '{userCode}': " +
                        "the source profile ID is already linked to another user.");
                }

                if (profileWithSameId is not null)
                {
                    targetProfile = profileWithSameId;
                    Skipped(result, "ParticipantProfile", targetProfile.Id);
                }
                else
                {
                    targetProfile = CloneScalarProperties(sourceProfile);
                    targetProfile.UserId = targetUser.Id;

                    _targetDb.ParticipantProfiles.Add(targetProfile);
                    await _targetDb.SaveChangesAsync(cancellationToken);

                    Restored(result, "ParticipantProfile", targetProfile.Id);
                }
            }
            else
            {
                Skipped(result, "ParticipantProfile", targetProfile.Id);
            }

            // 3. SOURCE ENROLLMENTS
            var sourceEnrollments = await sourceDb.Enrollments
                .AsNoTracking()
                .Where(x => x.ParticipantProfileId == sourceProfile.Id)
                .ToListAsync(cancellationToken);

            var enrollmentIds = sourceEnrollments
                .Select(x => x.Id)
                .ToList();

            // 4. TRAINING BATCHES
            var batchIds = sourceEnrollments
                .Select(x => x.TrainingBatchId)
                .Distinct()
                .ToList();

            var sourceBatches = await sourceDb.TrainingBatches
                .AsNoTracking()
                .Where(x => batchIds.Contains(x.Id))
                .ToListAsync(cancellationToken);

            foreach (var sourceBatch in sourceBatches)
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (await _targetDb.TrainingBatches.AnyAsync(
                        x => x.Id == sourceBatch.Id,
                        cancellationToken))
                {
                    Skipped(result, "TrainingBatch", sourceBatch.Id);
                    continue;
                }

                var programExists = await _targetDb.TrainingPrograms
                    .AnyAsync(
                        x => x.Id == sourceBatch.TrainingProgramId,
                        cancellationToken);

                if (!programExists)
                {
                    throw new InvalidOperationException(
                        $"Cannot restore TrainingBatch {sourceBatch.Id}: " +
                        $"TrainingProgram {sourceBatch.TrainingProgramId} " +
                        "is missing in production.");
                }

                var restoredBatch = CloneScalarProperties(sourceBatch);

                _targetDb.TrainingBatches.Add(restoredBatch);
                await _targetDb.SaveChangesAsync(cancellationToken);

                Restored(result, "TrainingBatch", restoredBatch.Id);
            }

            // 5. ENROLLMENTS
            foreach (var sourceEnrollment in sourceEnrollments)
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (await _targetDb.Enrollments.AnyAsync(
                        x => x.Id == sourceEnrollment.Id,
                        cancellationToken))
                {
                    Skipped(result, "Enrollment", sourceEnrollment.Id);
                    continue;
                }

                if (!await _targetDb.TrainingBatches.AnyAsync(
                        x => x.Id == sourceEnrollment.TrainingBatchId,
                        cancellationToken))
                {
                    throw new InvalidOperationException(
                        $"Cannot restore Enrollment {sourceEnrollment.Id}: " +
                        "its TrainingBatch is missing in production.");
                }

                var restoredEnrollment =
                    CloneScalarProperties(sourceEnrollment);

                restoredEnrollment.ParticipantProfileId = targetProfile.Id;

                _targetDb.Enrollments.Add(restoredEnrollment);
                await _targetDb.SaveChangesAsync(cancellationToken);

                Restored(result, "Enrollment", restoredEnrollment.Id);
            }

            // 6. WRITTEN ASSESSMENTS
            var sourceAssessments = await sourceDb.WrittenAssessments
                .AsNoTracking()
                .Where(x => batchIds.Contains(x.TrainingBatchId))
                .ToListAsync(cancellationToken);

            var assessmentIds = sourceAssessments
                .Select(x => x.Id)
                .ToList();

            foreach (var sourceAssessment in sourceAssessments)
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (await _targetDb.WrittenAssessments.AnyAsync(
                        x => x.Id == sourceAssessment.Id,
                        cancellationToken))
                {
                    Skipped(result, "WrittenAssessment", sourceAssessment.Id);
                    continue;
                }

                if (!await _targetDb.TrainingBatches.AnyAsync(
                        x => x.Id == sourceAssessment.TrainingBatchId,
                        cancellationToken))
                {
                    throw new InvalidOperationException(
                        $"Cannot restore WrittenAssessment {sourceAssessment.Id}: " +
                        "its TrainingBatch is missing.");
                }

                _targetDb.WrittenAssessments.Add(
                    CloneScalarProperties(sourceAssessment));

                await _targetDb.SaveChangesAsync(cancellationToken);

                Restored(result, "WrittenAssessment", sourceAssessment.Id);
            }

            // 7. ASSESSMENT QUESTIONS
            var sourceQuestions = await sourceDb.AssessmentQuestions
                .AsNoTracking()
                .Where(x => assessmentIds.Contains(x.WrittenAssessmentId))
                .ToListAsync(cancellationToken);

            var questionIds = sourceQuestions.Select(x => x.Id).ToList();

            foreach (var sourceQuestion in sourceQuestions)
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (await _targetDb.AssessmentQuestions.AnyAsync(
                        x => x.Id == sourceQuestion.Id,
                        cancellationToken))
                {
                    Skipped(result, "AssessmentQuestion", sourceQuestion.Id);
                    continue;
                }

                if (!await _targetDb.WrittenAssessments.AnyAsync(
                        x => x.Id == sourceQuestion.WrittenAssessmentId,
                        cancellationToken))
                {
                    throw new InvalidOperationException(
                        $"Cannot restore AssessmentQuestion {sourceQuestion.Id}: " +
                        "its WrittenAssessment is missing.");
                }

                _targetDb.AssessmentQuestions.Add(
                    CloneScalarProperties(sourceQuestion));

                await _targetDb.SaveChangesAsync(cancellationToken);

                Restored(result, "AssessmentQuestion", sourceQuestion.Id);
            }

            // 8. ASSESSMENT CHOICES
            var sourceChoices = await sourceDb.AssessmentChoices
                .AsNoTracking()
                .Where(x => questionIds.Contains(x.AssessmentQuestionId))
                .ToListAsync(cancellationToken);

            foreach (var sourceChoice in sourceChoices)
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (await _targetDb.AssessmentChoices.AnyAsync(
                        x => x.Id == sourceChoice.Id,
                        cancellationToken))
                {
                    Skipped(result, "AssessmentChoice", sourceChoice.Id);
                    continue;
                }

                if (!await _targetDb.AssessmentQuestions.AnyAsync(
                        x => x.Id == sourceChoice.AssessmentQuestionId,
                        cancellationToken))
                {
                    throw new InvalidOperationException(
                        $"Cannot restore AssessmentChoice {sourceChoice.Id}: " +
                        "its AssessmentQuestion is missing.");
                }

                _targetDb.AssessmentChoices.Add(
                    CloneScalarProperties(sourceChoice));

                await _targetDb.SaveChangesAsync(cancellationToken);

                Restored(result, "AssessmentChoice", sourceChoice.Id);
            }

            // 9. PARTICIPANT ASSESSMENT ATTEMPTS
            var sourceAttempts = await sourceDb.AssessmentAttempts
                .AsNoTracking()
                .Where(x =>
                    enrollmentIds.Contains(x.EnrollmentId) &&
                    assessmentIds.Contains(x.WrittenAssessmentId))
                .ToListAsync(cancellationToken);

            var attemptIds = sourceAttempts.Select(x => x.Id).ToList();

            foreach (var sourceAttempt in sourceAttempts)
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (await _targetDb.AssessmentAttempts.AnyAsync(
                        x => x.Id == sourceAttempt.Id,
                        cancellationToken))
                {
                    Skipped(result, "AssessmentAttempt", sourceAttempt.Id);
                    continue;
                }

                if (!await _targetDb.Enrollments.AnyAsync(
                        x => x.Id == sourceAttempt.EnrollmentId,
                        cancellationToken))
                {
                    throw new InvalidOperationException(
                        $"Cannot restore AssessmentAttempt {sourceAttempt.Id}: " +
                        "its Enrollment is missing.");
                }

                if (!await _targetDb.WrittenAssessments.AnyAsync(
                        x => x.Id == sourceAttempt.WrittenAssessmentId,
                        cancellationToken))
                {
                    throw new InvalidOperationException(
                        $"Cannot restore AssessmentAttempt {sourceAttempt.Id}: " +
                        "its WrittenAssessment is missing.");
                }

                _targetDb.AssessmentAttempts.Add(
                    CloneScalarProperties(sourceAttempt));

                await _targetDb.SaveChangesAsync(cancellationToken);

                Restored(result, "AssessmentAttempt", sourceAttempt.Id);
            }

            // 10. ASSESSMENT ANSWERS
            var sourceAnswers = await sourceDb.AssessmentAnswers
                .AsNoTracking()
                .Where(x => attemptIds.Contains(x.AssessmentAttemptId))
                .ToListAsync(cancellationToken);

            foreach (var sourceAnswer in sourceAnswers)
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (await _targetDb.AssessmentAnswers.AnyAsync(
                        x => x.Id == sourceAnswer.Id,
                        cancellationToken))
                {
                    Skipped(result, "AssessmentAnswer", sourceAnswer.Id);
                    continue;
                }

                if (!await _targetDb.AssessmentAttempts.AnyAsync(
                        x => x.Id == sourceAnswer.AssessmentAttemptId,
                        cancellationToken) ||
                    !await _targetDb.AssessmentQuestions.AnyAsync(
                        x => x.Id == sourceAnswer.AssessmentQuestionId,
                        cancellationToken))
                {
                    throw new InvalidOperationException(
                        $"Cannot restore AssessmentAnswer {sourceAnswer.Id}: " +
                        "its attempt or question is missing.");
                }

                if (sourceAnswer.SelectedChoiceId.HasValue &&
                    !await _targetDb.AssessmentChoices.AnyAsync(
                        x => x.Id == sourceAnswer.SelectedChoiceId.Value,
                        cancellationToken))
                {
                    throw new InvalidOperationException(
                        $"Cannot restore AssessmentAnswer {sourceAnswer.Id}: " +
                        "its selected choice is missing.");
                }

                _targetDb.AssessmentAnswers.Add(
                    CloneScalarProperties(sourceAnswer));

                await _targetDb.SaveChangesAsync(cancellationToken);

                Restored(result, "AssessmentAnswer", sourceAnswer.Id);
            }

            // 11. ASSESSMENT RESULTS
            var sourceResults = await sourceDb.AssessmentResults
                .AsNoTracking()
                .Where(x => attemptIds.Contains(x.AssessmentAttemptId))
                .ToListAsync(cancellationToken);

            foreach (var sourceResult in sourceResults)
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (await _targetDb.AssessmentResults.AnyAsync(
                        x => x.Id == sourceResult.Id ||
                             x.AssessmentAttemptId ==
                                 sourceResult.AssessmentAttemptId,
                        cancellationToken))
                {
                    Skipped(result, "AssessmentResult", sourceResult.Id);
                    continue;
                }

                if (!await _targetDb.AssessmentAttempts.AnyAsync(
                        x => x.Id == sourceResult.AssessmentAttemptId,
                        cancellationToken))
                {
                    throw new InvalidOperationException(
                        $"Cannot restore AssessmentResult {sourceResult.Id}: " +
                        "its attempt is missing.");
                }

                _targetDb.AssessmentResults.Add(
                    CloneScalarProperties(sourceResult));

                await _targetDb.SaveChangesAsync(cancellationToken);

                Restored(result, "AssessmentResult", sourceResult.Id);
            }

            // 12. ASSESSMENT RETAKE REQUESTS
            var sourceRetakeRequests = await sourceDb.AssessmentRetakeRequests
                .AsNoTracking()
                .Where(x =>
                    x.ParticipantId == sourceProfile.Id &&
                    assessmentIds.Contains(x.WrittenAssessmentId))
                .ToListAsync(cancellationToken);

            foreach (var sourceRequest in sourceRetakeRequests)
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (await _targetDb.AssessmentRetakeRequests.AnyAsync(
                        x => x.Id == sourceRequest.Id,
                        cancellationToken))
                {
                    Skipped(result, "AssessmentRetakeRequest", sourceRequest.Id);
                    continue;
                }

                if (!await _targetDb.AssessmentAttempts.AnyAsync(
                        x => x.Id == sourceRequest.PreviousAttemptId,
                        cancellationToken))
                {
                    throw new InvalidOperationException(
                        $"Cannot restore AssessmentRetakeRequest " +
                        $"{sourceRequest.Id}: its previous attempt is missing.");
                }

                var restoredRequest =
                    CloneScalarProperties(sourceRequest);

                restoredRequest.ParticipantId = targetProfile.Id;

                // Avoid an invalid ReviewedBy foreign key if the
                // reviewer no longer exists in production.
                if (restoredRequest.ReviewedBy.HasValue &&
                    !await _targetDb.Users.AnyAsync(
                        x => x.Id == restoredRequest.ReviewedBy.Value,
                        cancellationToken))
                {
                    restoredRequest.ReviewedBy = null;
                }

                _targetDb.AssessmentRetakeRequests.Add(restoredRequest);
                await _targetDb.SaveChangesAsync(cancellationToken);

                Restored(result, "AssessmentRetakeRequest", restoredRequest.Id);
            }

            // 13. ENROLLMENT DOCUMENTS
            var sourceDocuments = await sourceDb.EnrollmentDocuments
                .AsNoTracking()
                .Where(x => enrollmentIds.Contains(x.EnrollmentId))
                .ToListAsync(cancellationToken);

            foreach (var sourceDocument in sourceDocuments)
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (await _targetDb.EnrollmentDocuments.AnyAsync(
                        x => x.Id == sourceDocument.Id,
                        cancellationToken))
                {
                    Skipped(result, "EnrollmentDocument", sourceDocument.Id);
                    continue;
                }

                if (!await _targetDb.Enrollments.AnyAsync(
                        x => x.Id == sourceDocument.EnrollmentId,
                        cancellationToken))
                {
                    throw new InvalidOperationException(
                        $"Cannot restore EnrollmentDocument {sourceDocument.Id}: " +
                        "its Enrollment is missing.");
                }

                _targetDb.EnrollmentDocuments.Add(
                    CloneScalarProperties(sourceDocument));

                await _targetDb.SaveChangesAsync(cancellationToken);

                Restored(result, "EnrollmentDocument", sourceDocument.Id);
            }

            // 14. ATTENDANCE RECORDS
            var sourceAttendance = await sourceDb.AttendanceRecords
                .AsNoTracking()
                .Where(x => enrollmentIds.Contains(x.EnrollmentId))
                .ToListAsync(cancellationToken);

            foreach (var sourceRecord in sourceAttendance)
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (await _targetDb.AttendanceRecords.AnyAsync(
                        x => x.Id == sourceRecord.Id,
                        cancellationToken))
                {
                    Skipped(result, "AttendanceRecord", sourceRecord.Id);
                    continue;
                }

                if (!await _targetDb.Enrollments.AnyAsync(
                        x => x.Id == sourceRecord.EnrollmentId,
                        cancellationToken))
                {
                    throw new InvalidOperationException(
                        $"Cannot restore AttendanceRecord {sourceRecord.Id}: " +
                        "its Enrollment is missing.");
                }

                if (!await _targetDb.AttendanceSessions.AnyAsync(
                        x => x.Id == sourceRecord.AttendanceSessionId,
                        cancellationToken))
                {
                    throw new InvalidOperationException(
                        $"Cannot restore AttendanceRecord {sourceRecord.Id}: " +
                        "its AttendanceSession is missing.");
                }

                _targetDb.AttendanceRecords.Add(
                    CloneScalarProperties(sourceRecord));

                await _targetDb.SaveChangesAsync(cancellationToken);

                Restored(result, "AttendanceRecord", sourceRecord.Id);
            }

            // 15. CERTIFICATES
            var sourceCertificates = await sourceDb.Certificates
                .AsNoTracking()
                .Where(x => enrollmentIds.Contains(x.EnrollmentId))
                .ToListAsync(cancellationToken);

            foreach (var sourceCertificate in sourceCertificates)
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (await _targetDb.Certificates.AnyAsync(
                        x => x.Id == sourceCertificate.Id,
                        cancellationToken))
                {
                    Skipped(result, "Certificate", sourceCertificate.Id);
                    continue;
                }

                if (!await _targetDb.Enrollments.AnyAsync(
                        x => x.Id == sourceCertificate.EnrollmentId,
                        cancellationToken))
                {
                    throw new InvalidOperationException(
                        $"Cannot restore Certificate {sourceCertificate.Id}: " +
                        "its Enrollment is missing.");
                }

                _targetDb.Certificates.Add(
                    CloneScalarProperties(sourceCertificate));

                await _targetDb.SaveChangesAsync(cancellationToken);

                Restored(result, "Certificate", sourceCertificate.Id);
            }

            // 16. LEARNING SECTION PROGRESS
            var sourceProgress = await sourceDb.LearningSectionProgresses
                .AsNoTracking()
                .Where(x => enrollmentIds.Contains(x.EnrollmentId))
                .ToListAsync(cancellationToken);

            foreach (var sourceItem in sourceProgress)
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (await _targetDb.LearningSectionProgresses.AnyAsync(
                        x => x.Id == sourceItem.Id ||
                             (x.EnrollmentId == sourceItem.EnrollmentId &&
                              x.LearningSectionId == sourceItem.LearningSectionId),
                        cancellationToken))
                {
                    Skipped(result, "LearningSectionProgress", sourceItem.Id);
                    continue;
                }

                if (!await _targetDb.LearningSections.AnyAsync(
                        x => x.Id == sourceItem.LearningSectionId,
                        cancellationToken))
                {
                    throw new InvalidOperationException(
                        $"Cannot restore LearningSectionProgress " +
                        $"{sourceItem.Id}: its LearningSection is missing.");
                }

                _targetDb.LearningSectionProgresses.Add(
                    CloneScalarProperties(sourceItem));

                await _targetDb.SaveChangesAsync(cancellationToken);

                Restored(result, "LearningSectionProgress", sourceItem.Id);
            }

            // 17. PRACTICAL ASSESSMENT RESULTS
            var sourcePracticalResults =
                await sourceDb.PracticalAssessmentResults
                    .AsNoTracking()
                    .Where(x => enrollmentIds.Contains(x.EnrollmentId))
                    .ToListAsync(cancellationToken);

            var practicalResultIds = sourcePracticalResults
                .Select(x => x.Id)
                .ToList();

            foreach (var sourceResult in sourcePracticalResults)
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (await _targetDb.PracticalAssessmentResults.AnyAsync(
                        x => x.Id == sourceResult.Id ||
                             (x.EnrollmentId == sourceResult.EnrollmentId &&
                              x.PracticalAssessmentId ==
                                  sourceResult.PracticalAssessmentId),
                        cancellationToken))
                {
                    Skipped(result, "PracticalAssessmentResult", sourceResult.Id);
                    continue;
                }

                if (!await _targetDb.Enrollments.AnyAsync(
                        x => x.Id == sourceResult.EnrollmentId,
                        cancellationToken))
                {
                    throw new InvalidOperationException(
                        $"Cannot restore PracticalAssessmentResult " +
                        $"{sourceResult.Id}: its Enrollment is missing.");
                }

                if (!await _targetDb.PracticalAssessments.AnyAsync(
                        x => x.Id == sourceResult.PracticalAssessmentId,
                        cancellationToken))
                {
                    throw new InvalidOperationException(
                        $"Cannot restore PracticalAssessmentResult " +
                        $"{sourceResult.Id}: its PracticalAssessment is missing.");
                }

                _targetDb.PracticalAssessmentResults.Add(
                    CloneScalarProperties(sourceResult));

                await _targetDb.SaveChangesAsync(cancellationToken);

                Restored(result, "PracticalAssessmentResult", sourceResult.Id);
            }

            // 18. PRACTICAL ASSESSMENT CRITERION SCORES
            var sourceScores =
                await sourceDb.PracticalAssessmentCriterionScores
                    .AsNoTracking()
                    .Where(x =>
                        practicalResultIds.Contains(
                            x.PracticalAssessmentResultId))
                    .ToListAsync(cancellationToken);

            foreach (var sourceScore in sourceScores)
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (await _targetDb.PracticalAssessmentCriterionScores.AnyAsync(
                        x => x.Id == sourceScore.Id ||
                             (x.PracticalAssessmentResultId ==
                                  sourceScore.PracticalAssessmentResultId &&
                              x.PracticalAssessmentCriterionId ==
                                  sourceScore.PracticalAssessmentCriterionId),
                        cancellationToken))
                {
                    Skipped(
                        result,
                        "PracticalAssessmentCriterionScore",
                        sourceScore.Id);

                    continue;
                }

                if (!await _targetDb.PracticalAssessmentResults.AnyAsync(
                        x => x.Id == sourceScore.PracticalAssessmentResultId,
                        cancellationToken))
                {
                    throw new InvalidOperationException(
                        $"Cannot restore PracticalAssessmentCriterionScore " +
                        $"{sourceScore.Id}: its result is missing.");
                }

                if (!await _targetDb.PracticalAssessmentCriteria.AnyAsync(
                        x => x.Id == sourceScore.PracticalAssessmentCriterionId,
                        cancellationToken))
                {
                    throw new InvalidOperationException(
                        $"Cannot restore PracticalAssessmentCriterionScore " +
                        $"{sourceScore.Id}: its criterion is missing.");
                }

                _targetDb.PracticalAssessmentCriterionScores.Add(
                    CloneScalarProperties(sourceScore));

                await _targetDb.SaveChangesAsync(cancellationToken);

                Restored(
                    result,
                    "PracticalAssessmentCriterionScore",
                    sourceScore.Id);
            }

            await transaction.CommitAsync(cancellationToken);

            result.Success = true;
            result.Messages.Add(
                $"Recovery completed for UserCode '{userCode}'. " +
                $"Restored: {result.RestoredRecords}; " +
                $"skipped: {result.SkippedRecords}; " +
                $"failed: {result.FailedRecords}.");

            return result;
        }
        catch (OperationCanceledException)
        {
            await transaction.RollbackAsync(CancellationToken.None);
            throw;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(CancellationToken.None);

            _logger.LogError(
                ex,
                "Full user recovery failed for UserCode {UserCode}",
                userCode);

            result.Success = false;
            result.FailedRecords++;

            result.Messages.Add(
                $"Recovery failed. The transaction was rolled back. {ex.Message}");

            return result;
        }
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private static string ValidateUserCode(string userCode)
    {
        if (string.IsNullOrWhiteSpace(userCode))
        {
            throw new ArgumentException(
                "UserCode is required.",
                nameof(userCode));
        }

        return userCode.Trim();
    }

    private ApplicationDbContext CreateRecoveryDbContext()
    {
        var connectionString =
            _configuration.GetConnectionString("RecoveryConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "ConnectionStrings:RecoveryConnection is not configured.");
        }

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        return new ApplicationDbContext(options, _cacheService);
    }

    private async Task EnsureUserIdentifiersAreAvailableAsync(
        User sourceUser,
        CancellationToken cancellationToken)
    {
        var email = sourceUser.Email?.Trim();
        var userCode = sourceUser.UserCode?.Trim();

        if (!string.IsNullOrWhiteSpace(email))
        {
            var emailExists = await _targetDb.Users
                .AsNoTracking()
                .AnyAsync(
                    x => x.Email.ToLower() == email.ToLower() &&
                         x.UserCode != userCode,
                    cancellationToken);

            if (emailExists)
            {
                throw new InvalidOperationException(
                    "Cannot restore account: this email belongs to " +
                    "another production account.");
            }
        }

        if (!string.IsNullOrWhiteSpace(userCode))
        {
            var codeExists = await _targetDb.Users
                .AsNoTracking()
                .AnyAsync(
                    x => x.UserCode == userCode,
                    cancellationToken);

            if (codeExists)
            {
                throw new InvalidOperationException(
                    "Cannot restore account: this UserCode already exists.");
            }
        }
    }

    private static T CloneScalarProperties<T>(T source)
        where T : class, new()
    {
        var destination = new T();

        foreach (var property in typeof(T).GetProperties(
                     BindingFlags.Instance | BindingFlags.Public))
        {
            if (!property.CanRead ||
                !property.CanWrite ||
                property.GetIndexParameters().Length > 0)
            {
                continue;
            }

            var type = property.PropertyType;

            if (type != typeof(string) && !type.IsValueType)
            {
                continue;
            }

            property.SetValue(
                destination,
                property.GetValue(source));
        }

        return destination;
    }

    private static void AddSummary(
        FullUserRecoveryPreviewDto result,
        string entityName,
        int sourceCount,
        int existingCount)
    {
        result.Entities.Add(new FullRecoveryEntitySummaryDto
        {
            EntityName = entityName,
            SourceCount = sourceCount,
            ExistingCount = existingCount,
            MissingCount = Math.Max(0, sourceCount - existingCount)
        });
    }

    private static void CalculatePreviewTotals(
        FullUserRecoveryPreviewDto result)
    {
        result.RelatedRecordsFound =
            result.Entities.Sum(x => x.SourceCount);

        result.RecordsAlreadyInProduction =
            result.Entities.Sum(x => x.ExistingCount);

        result.RecordsMissingFromProduction =
            result.Entities.Sum(x => x.MissingCount);
    }

    private static void Restored(
        FullUserRecoveryResultDto result,
        string entityName,
        Guid id)
    {
        result.RestoredRecords++;
        result.Messages.Add($"{entityName} {id} restored.");
    }

    private static void Skipped(
        FullUserRecoveryResultDto result,
        string entityName,
        Guid id)
    {
        result.SkippedRecords++;
        result.Messages.Add(
            $"{entityName} {id} already exists. Existing data was preserved.");
    }

    private static string BuildUserName(object user)
    {
        var type = user.GetType();

        var firstName = ReadString(type, user, "FirstName");
        var middleName = ReadString(type, user, "MiddleName");
        var lastName = ReadString(type, user, "LastName");

        var fullName = string.Join(
            " ",
            new[] { firstName, middleName, lastName }
                .Where(x => !string.IsNullOrWhiteSpace(x)));

        return string.IsNullOrWhiteSpace(fullName)
            ? ReadString(type, user, "FullName") ?? string.Empty
            : fullName;
    }

    private static string? ReadString(
        Type type,
        object instance,
        string propertyName)
    {
        return type.GetProperty(propertyName)
            ?.GetValue(instance)
            ?.ToString();
    }
}
