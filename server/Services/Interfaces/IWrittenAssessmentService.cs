using server.DTOs.Assessments;
using server.Services.DocumentExtraction;

namespace server.Services.Interfaces;

public interface IWrittenAssessmentService
{
// =========================================================
// ADMIN - ASSESSMENT
// =========================================================

Task<IReadOnlyList<WrittenAssessmentDto>>
    GetByBatchIdAsync(
        Guid trainingBatchId);

Task<WrittenAssessmentDto?>
    GetByIdAsync(
        Guid id);

Task<WrittenAssessmentDto>
    CreateAsync(
        CreateWrittenAssessmentRequest request);

Task<WrittenAssessmentDto>
    UpdateAsync(
        Guid id,
        UpdateWrittenAssessmentRequest request);

Task DeleteAsync(
    Guid id);

Task<WrittenAssessmentDto>
    SetPublishedAsync(
        Guid id,
        bool isPublished);

// =========================================================
// ADMIN - QUESTIONS
// =========================================================

Task<IReadOnlyList<AdminAssessmentQuestionDto>>
    GetQuestionsAsync(
        Guid writtenAssessmentId);

Task<AdminAssessmentQuestionDto>
    CreateQuestionAsync(
        CreateAssessmentQuestionRequest request);

Task<AdminAssessmentQuestionDto>
    UpdateQuestionAsync(
        Guid questionId,
        UpdateAssessmentQuestionRequest request);

Task DeleteQuestionAsync(
    Guid questionId);

// =========================================================
// ADMIN - CHOICES
// =========================================================

Task<AdminAssessmentChoiceDto>
    CreateChoiceAsync(
        CreateAssessmentChoiceRequest request);

Task<AdminAssessmentChoiceDto>
    UpdateChoiceAsync(
        Guid choiceId,
        UpdateAssessmentChoiceRequest request);

Task DeleteChoiceAsync(
    Guid choiceId);

// =========================================================
// ADMIN - AI QUESTION GENERATION
// =========================================================

Task<IReadOnlyList<AdminAssessmentQuestionDto>>
    GenerateQuestionsFromDocumentAsync(
        Guid writtenAssessmentId,
        string rawText,
        int questionCount,
        IReadOnlyList<DocumentImage> images,
        IReadOnlyList<DocumentMediaLink> mediaLinks,
        CancellationToken cancellationToken = default);

// =========================================================
// PARTICIPANT
// =========================================================

Task<ParticipantAssessmentDto?>
    GetParticipantAssessmentAsync(
        Guid participantUserId,
        Guid writtenAssessmentId);

Task<AssessmentAttemptDto>
    StartAttemptAsync(
        Guid participantUserId,
        Guid writtenAssessmentId);

Task<AssessmentAttemptDto?>
    GetAttemptAsync(
        Guid participantUserId,
        Guid attemptId);

Task<AssessmentResultDto>
    SubmitAttemptAsync(
        Guid participantUserId,
        SubmitAssessmentRequest request);

        Task<IReadOnlyList<AssessmentResultDto>>
    GetMyResultsAsync(
        Guid participantUserId,
        Guid writtenAssessmentId);

Task<IReadOnlyList<ParticipantAssessmentDto>>
    GetParticipantAssessmentsByBatchIdAsync(
        Guid participantUserId,
        Guid trainingBatchId);
}
