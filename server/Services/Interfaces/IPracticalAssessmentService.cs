using server.DTOs.Assessments;

namespace server.Services.Interfaces;

public interface IPracticalAssessmentService
{
    // ==========================================================
    // ADMIN
    // ==========================================================

    Task<PracticalAssessmentDto> CreateAsync(
        CreatePracticalAssessmentRequest request);

    Task<IReadOnlyList<PracticalAssessmentDto>> GetAllAsync();

    Task<PracticalAssessmentDto> GetByIdAsync(
        Guid id);

    Task<PracticalAssessmentDto> UpdateAsync(
        Guid id,
        CreatePracticalAssessmentRequest request);

    Task DeleteAsync(
        Guid id);

    Task<PracticalAssessmentDto> SetPublishedAsync(
        Guid id,
        bool isPublished);


    // ==========================================================
    // TRAINER
    // ==========================================================

    Task<IReadOnlyList<PracticalAssessmentDto>>
        GetAssignedAssessmentsAsync(
            Guid trainerUserId);

    Task<PracticalAssessmentResultDto>
        EvaluateAsync(
            Guid trainerUserId,
            EvaluatePracticalAssessmentRequest request);

    Task<IReadOnlyList<PracticalAssessmentResultDto>>
        GetResultsAsync(
            Guid trainerUserId,
            Guid practicalAssessmentId);

    Task<PracticalAssessmentResultDto>
        GetResultAsync(
            Guid trainerUserId,
            Guid enrollmentId);
}