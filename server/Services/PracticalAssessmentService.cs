using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Assessments;
using server.Models.Assessment;
using server.Services.Interfaces;

namespace server.Services;

public class PracticalAssessmentService
    : IPracticalAssessmentService
{
    private readonly ApplicationDbContext _db;

    public PracticalAssessmentService(
        ApplicationDbContext db)
    {
        _db = db;
    }


    // ==========================================================
    // ADMIN
    // CREATE
    // ==========================================================

    public async Task<PracticalAssessmentDto> CreateAsync(
        CreatePracticalAssessmentRequest request)
    {
        ValidateAssessmentRequest(request);

        var batchExists =
            await _db.TrainingBatches
                .AnyAsync(x =>
                    x.Id == request.TrainingBatchId);

        if (!batchExists)
        {
            throw new KeyNotFoundException(
                "Training batch not found.");
        }

        var duplicate =
            await _db.PracticalAssessments
                .AnyAsync(x =>
                    x.TrainingBatchId ==
                        request.TrainingBatchId &&
                    x.Title.ToLower() ==
                        request.Title
                            .Trim()
                            .ToLower());

        if (duplicate)
        {
            throw new InvalidOperationException(
                "A practical assessment with the same title already exists for this training batch.");
        }

        var assessment =
            new PracticalAssessment
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

                CreatedAt =
                    DateTime.UtcNow
            };


        foreach (
            var criterionRequest
            in request.Criteria
                .OrderBy(x => x.DisplayOrder))
        {
            assessment.Criteria.Add(
                new PracticalAssessmentCriterion
                {
                    Id = Guid.NewGuid(),

                    Name =
                        criterionRequest.Name.Trim(),

                    Description =
                        NormalizeNullable(
                            criterionRequest.Description),

                    WeightPercentage =
                        criterionRequest.WeightPercentage,

                    DisplayOrder =
                        criterionRequest.DisplayOrder
                });
        }

        _db.PracticalAssessments.Add(
            assessment);

        await _db.SaveChangesAsync();

        return MapAssessment(
            assessment);
    }


    // ==========================================================
    // ADMIN
    // GET ALL
    // ==========================================================

    public async Task<
        IReadOnlyList<PracticalAssessmentDto>>
        GetAllAsync()
    {
        var assessments =
            await _db.PracticalAssessments
                .AsNoTracking()
                .Include(x => x.Criteria)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

        return assessments
            .Select(MapAssessment)
            .ToList();
    }


    // ==========================================================
    // ADMIN
    // GET BY ID
    // ==========================================================

    public async Task<PracticalAssessmentDto>
        GetByIdAsync(Guid id)
    {
        var assessment =
            await _db.PracticalAssessments
                .AsNoTracking()
                .Include(x => x.Criteria)
                .FirstOrDefaultAsync(
                    x => x.Id == id);

        if (assessment is null)
        {
            throw new KeyNotFoundException(
                "Practical assessment not found.");
        }

        return MapAssessment(
            assessment);
    }


    // ==========================================================
    // ADMIN
    // UPDATE
    // ==========================================================
// ==========================================================
// ADMIN
// UPDATE
// ==========================================================

public async Task<PracticalAssessmentDto>
    UpdateAsync(
        Guid id,
        CreatePracticalAssessmentRequest request)
{
    ValidateAssessmentRequest(request);

    // ------------------------------------------------------
    // Load assessment
    // ------------------------------------------------------

    var assessment =
        await _db.PracticalAssessments
            .Include(x => x.Criteria)
            .FirstOrDefaultAsync(
                x => x.Id == id);

    if (assessment is null)
    {
        throw new KeyNotFoundException(
            "Practical assessment not found.");
    }


    // ------------------------------------------------------
    // Validate training batch
    // ------------------------------------------------------

    if (
        assessment.TrainingBatchId !=
        request.TrainingBatchId)
    {
        var batchExists =
            await _db.TrainingBatches
                .AnyAsync(x =>
                    x.Id ==
                    request.TrainingBatchId);

        if (!batchExists)
        {
            throw new KeyNotFoundException(
                "Training batch not found.");
        }
    }


    // ------------------------------------------------------
    // Check duplicate title
    // ------------------------------------------------------

    var duplicate =
        await _db.PracticalAssessments
            .AnyAsync(x =>
                x.Id != id &&
                x.TrainingBatchId ==
                    request.TrainingBatchId &&
                x.Title.ToLower() ==
                    request.Title
                        .Trim()
                        .ToLower());

    if (duplicate)
    {
        throw new InvalidOperationException(
            "A practical assessment with the same title already exists for this training batch.");
    }


    // ------------------------------------------------------
    // Update assessment information
    // ------------------------------------------------------

    assessment.TrainingBatchId =
        request.TrainingBatchId;

    assessment.Title =
        request.Title.Trim();

    assessment.Description =
        NormalizeNullable(
            request.Description);

    assessment.PassingPercentage =
        request.PassingPercentage;

    assessment.UpdatedAt =
        DateTime.UtcNow;

// ------------------------------------------------------
// Prevent editing assessment criteria after evaluation
// ------------------------------------------------------

var hasResults =
    await _db.PracticalAssessmentResults
        .AnyAsync(x =>
            x.PracticalAssessmentId == id);

if (hasResults)
{
    throw new InvalidOperationException(
        "This practical assessment cannot be edited because evaluation results already exist.");
}
    // ------------------------------------------------------
    // Remove existing criteria
    // ------------------------------------------------------

    var existingCriteria =
        await _db.PracticalAssessmentCriteria
            .Where(x =>
                x.PracticalAssessmentId ==
                assessment.Id)
            .ToListAsync();

    if (existingCriteria.Count > 0)
    {
        _db.PracticalAssessmentCriteria
            .RemoveRange(existingCriteria);
    }


    // ------------------------------------------------------
    // Add updated criteria
    // ------------------------------------------------------

    foreach (
        var criterionRequest
        in request.Criteria
            .OrderBy(x => x.DisplayOrder))
    {
        var criterion =
            new PracticalAssessmentCriterion
            {
                Id = Guid.NewGuid(),

                PracticalAssessmentId =
                    assessment.Id,

                Name =
                    criterionRequest.Name.Trim(),

                Description =
                    NormalizeNullable(
                        criterionRequest.Description),

                WeightPercentage =
                    criterionRequest.WeightPercentage,

                DisplayOrder =
                    criterionRequest.DisplayOrder
            };

        _db.PracticalAssessmentCriteria
            .Add(criterion);
    }


    // ------------------------------------------------------
    // Save changes
    // ------------------------------------------------------

    await _db.SaveChangesAsync();


    // ------------------------------------------------------
    // Reload updated assessment
    // ------------------------------------------------------

    var updatedAssessment =
        await _db.PracticalAssessments
            .AsNoTracking()
            .Include(x => x.Criteria)
            .FirstOrDefaultAsync(
                x => x.Id == id);

    if (updatedAssessment is null)
    {
        throw new KeyNotFoundException(
            "Practical assessment could not be reloaded after update.");
    }


    // ------------------------------------------------------
    // Return
    // ------------------------------------------------------

    return MapAssessment(
        updatedAssessment);
}

    // ==========================================================
    // ADMIN
    // DELETE
    // ==========================================================

    public async Task DeleteAsync(
        Guid id)
    {
        var assessment =
            await _db.PracticalAssessments
                .FirstOrDefaultAsync(
                    x => x.Id == id);

        if (assessment is null)
        {
            throw new KeyNotFoundException(
                "Practical assessment not found.");
        }

        var hasResults =
            await _db.PracticalAssessmentResults
                .AnyAsync(x =>
                    x.PracticalAssessmentId ==
                    id);

        if (hasResults)
        {
            throw new InvalidOperationException(
                "This practical assessment cannot be deleted because evaluation results already exist.");
        }

        _db.PracticalAssessments.Remove(
            assessment);

        await _db.SaveChangesAsync();
    }


    // ==========================================================
    // ADMIN
    // PUBLISH / UNPUBLISH
    // ==========================================================

    public async Task<PracticalAssessmentDto>
        SetPublishedAsync(
            Guid id,
            bool isPublished)
    {
        var assessment =
            await _db.PracticalAssessments
                .Include(x => x.Criteria)
                .FirstOrDefaultAsync(
                    x => x.Id == id);

        if (assessment is null)
        {
            throw new KeyNotFoundException(
                "Practical assessment not found.");
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
    // TRAINER
    // GET ASSIGNED ASSESSMENTS
    // ==========================================================

    public async Task<
        IReadOnlyList<PracticalAssessmentDto>>
        GetAssignedAssessmentsAsync(
            Guid trainerUserId)
    {
        var trainerProfileId =
            await _db.TrainerProfiles
                .Where(x =>
                    x.UserId == trainerUserId)
                .Select(x => x.Id)
                .FirstOrDefaultAsync();

        if (trainerProfileId == Guid.Empty)
        {
            throw new KeyNotFoundException(
                "Trainer profile not found.");
        }

        var assessments =
            await _db.PracticalAssessments
                .AsNoTracking()
                .Include(x => x.Criteria)
                .Where(x =>
                    _db.TrainerAssignments.Any(
                        assignment =>
                            assignment.TrainingBatchId ==
                                x.TrainingBatchId &&
                            assignment.TrainerProfileId ==
                                trainerProfileId &&
                            assignment.IsActive))
                .OrderByDescending(
                    x => x.CreatedAt)
                .ToListAsync();

        return assessments
            .Select(MapAssessment)
            .ToList();
    }


    // ==========================================================
    // TRAINER
    // EVALUATE PARTICIPANT
    // ==========================================================

    public async Task<PracticalAssessmentResultDto>
        EvaluateAsync(
            Guid trainerUserId,
            EvaluatePracticalAssessmentRequest request)
    {
        if (
            request.CriterionScores is null ||
            request.CriterionScores.Count == 0)
        {
            throw new InvalidOperationException(
                "At least one criterion score is required.");
        }


        // ------------------------------------------------------
        // Load assessment
        // ------------------------------------------------------

        var assessment =
            await _db.PracticalAssessments
                .Include(x => x.Criteria)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        request.PracticalAssessmentId);

        if (assessment is null)
        {
            throw new KeyNotFoundException(
                "Practical assessment not found.");
        }


        // ------------------------------------------------------
        // Trainer authorization
        // ------------------------------------------------------

        var trainerProfileId =
            await _db.TrainerProfiles
                .Where(x =>
                    x.UserId == trainerUserId)
                .Select(x => x.Id)
                .FirstOrDefaultAsync();

        if (trainerProfileId == Guid.Empty)
        {
            throw new KeyNotFoundException(
                "Trainer profile not found.");
        }

        var isAssigned =
            await _db.TrainerAssignments
                .AnyAsync(x =>
                    x.TrainingBatchId ==
                        assessment.TrainingBatchId &&
                    x.TrainerProfileId ==
                        trainerProfileId &&
                    x.IsActive);

        if (!isAssigned)
        {
            throw new UnauthorizedAccessException(
                "You are not assigned to this training batch.");
        }


        // ------------------------------------------------------
        // Load enrollment
        // ------------------------------------------------------

        var enrollment =
            await _db.Enrollments
                .Include(x =>
                    x.ParticipantProfile)
                .Include(x =>
                    x.TrainingBatch)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        request.EnrollmentId);

        if (enrollment is null)
        {
            throw new KeyNotFoundException(
                "Enrollment not found.");
        }


        // ------------------------------------------------------
        // Make sure enrollment belongs to assessment batch
        // ------------------------------------------------------

        if (
            enrollment.TrainingBatchId !=
            assessment.TrainingBatchId)
        {
            throw new InvalidOperationException(
                "This participant is not enrolled in the training batch for this assessment.");
        }


        // ------------------------------------------------------
        // Validate criterion IDs
        // ------------------------------------------------------

        var criteria =
            assessment.Criteria
                .OrderBy(x => x.DisplayOrder)
                .ToList();

        if (criteria.Count == 0)
        {
            throw new InvalidOperationException(
                "This practical assessment has no criteria.");
        }


        var criterionIds =
            criteria
                .Select(x => x.Id)
                .ToHashSet();

        var submittedIds =
            request.CriterionScores
                .Select(x => x.CriterionId)
                .ToList();


        if (
            submittedIds.Count !=
            submittedIds.Distinct().Count())
        {
            throw new InvalidOperationException(
                "Duplicate criterion scores are not allowed.");
        }


        if (
            submittedIds.Any(
                id => !criterionIds.Contains(id)))
        {
            throw new InvalidOperationException(
                "One or more submitted criteria do not belong to this practical assessment.");
        }


        if (
            submittedIds.Count !=
            criteria.Count)
        {
            throw new InvalidOperationException(
                "A score must be provided for every assessment criterion.");
        }


        // ------------------------------------------------------
        // Calculate weighted score
        // ------------------------------------------------------

        decimal totalScore = 0;

        foreach (var criterion in criteria)
        {
            var submitted =
                request.CriterionScores
                    .First(x =>
                        x.CriterionId ==
                        criterion.Id);

            if (
                submitted.Score < 0 ||
                submitted.Score > 100)
            {
                throw new InvalidOperationException(
                    $"Score for '{criterion.Name}' must be between 0 and 100.");
            }

            var weightedScore =
                submitted.Score *
                criterion.WeightPercentage /
                100m;

            totalScore +=
                weightedScore;
        }


        totalScore =
            Math.Round(
                totalScore,
                2,
                MidpointRounding.AwayFromZero);


        var percentage =
            totalScore;

        var isPassed =
            percentage >=
            assessment.PassingPercentage;


      // ------------------------------------------------------
// Existing result
// ------------------------------------------------------

var result =
    await _db.PracticalAssessmentResults
        .Include(x => x.CriterionScores)
        .FirstOrDefaultAsync(
            x =>
                x.PracticalAssessmentId ==
                    assessment.Id &&
                x.EnrollmentId ==
                    enrollment.Id);

if (result is null)
{
    // --------------------------------------------------
    // CREATE NEW RESULT
    // --------------------------------------------------

    result =
        new PracticalAssessmentResult
        {
            Id = Guid.NewGuid(),

            PracticalAssessmentId =
                assessment.Id,

            EnrollmentId =
                enrollment.Id,

            TotalScore =
                totalScore,

            Percentage =
                percentage,

            IsPassed =
                isPassed,

            TrainerRemarks =
                NormalizeNullable(
                    request.TrainerRemarks),

            EvaluatedByUserId =
                trainerUserId,

            EvaluatedAt =
                DateTime.UtcNow
        };

    _db.PracticalAssessmentResults.Add(result);

    // Add criterion scores
    foreach (var criterion in criteria)
    {
        var submitted =
            request.CriterionScores
                .First(x =>
                    x.CriterionId ==
                    criterion.Id);

        _db.PracticalAssessmentCriterionScores.Add(
            new PracticalAssessmentCriterionScore
            {
                Id = Guid.NewGuid(),

                PracticalAssessmentResultId =
                    result.Id,

                PracticalAssessmentCriterionId =
                    criterion.Id,

                Score =
                    submitted.Score
            });
    }
}
else
{
    // --------------------------------------------------
    // UPDATE EXISTING RESULT
    // --------------------------------------------------

    result.TotalScore =
        totalScore;

    result.Percentage =
        percentage;

    result.IsPassed =
        isPassed;

    result.TrainerRemarks =
        NormalizeNullable(
            request.TrainerRemarks);

    result.EvaluatedByUserId =
        trainerUserId;

    result.EvaluatedAt =
        DateTime.UtcNow;

    // --------------------------------------------------
    // UPDATE EXISTING CRITERION SCORES
    // --------------------------------------------------

    var existingScores =
        await _db.PracticalAssessmentCriterionScores
            .Where(x =>
                x.PracticalAssessmentResultId ==
                result.Id)
            .ToListAsync();

    foreach (var criterion in criteria)
    {
        var submitted =
            request.CriterionScores
                .First(x =>
                    x.CriterionId ==
                    criterion.Id);

        var existingScore =
            existingScores.FirstOrDefault(
                x =>
                    x.PracticalAssessmentCriterionId ==
                    criterion.Id);

        if (existingScore is not null)
        {
            // UPDATE existing row
            existingScore.Score =
                submitted.Score;
        }
        else
        {
            // ADD only if the score does not exist
            _db.PracticalAssessmentCriterionScores.Add(
                new PracticalAssessmentCriterionScore
                {
                    Id = Guid.NewGuid(),

                    PracticalAssessmentResultId =
                        result.Id,

                    PracticalAssessmentCriterionId =
                        criterion.Id,

                    Score =
                        submitted.Score
                });
        }
    }

    // --------------------------------------------------
    // REMOVE OLD SCORES
    // --------------------------------------------------

    var submittedCriterionIds =
        request.CriterionScores
            .Select(x => x.CriterionId)
            .ToHashSet();

    var obsoleteScores =
        existingScores
            .Where(x =>
                !submittedCriterionIds.Contains(
                    x.PracticalAssessmentCriterionId))
            .ToList();

    if (obsoleteScores.Count > 0)
    {
        _db.PracticalAssessmentCriterionScores
            .RemoveRange(obsoleteScores);
    }
}

// ------------------------------------------------------
// SAVE
// ------------------------------------------------------

await _db.SaveChangesAsync();

// ------------------------------------------------------
// Reload complete result
// ------------------------------------------------------

return await GetResultInternalAsync(
    result.Id);
    }


    // ==========================================================
    // TRAINER
    // GET RESULTS
    // ==========================================================

    public async Task<
        IReadOnlyList<PracticalAssessmentResultDto>>
        GetResultsAsync(
            Guid trainerUserId,
            Guid practicalAssessmentId)
    {
        var assessment =
            await _db.PracticalAssessments
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        practicalAssessmentId);

        if (assessment is null)
        {
            throw new KeyNotFoundException(
                "Practical assessment not found.");
        }

        await EnsureTrainerAssignedAsync(
            trainerUserId,
            assessment.TrainingBatchId);


       var results = await _db.PracticalAssessmentResults
    .Include(x => x.PracticalAssessment)

    .Include(x => x.Enrollment)
        .ThenInclude(x => x.ParticipantProfile)

    .Include(x => x.CriterionScores)
        .ThenInclude(x => x.PracticalAssessmentCriterion)

    .Where(x =>
        x.PracticalAssessmentId ==
        practicalAssessmentId)

    .OrderByDescending(x => x.EvaluatedAt)

    .ToListAsync();

        return results
            .Select(MapResult)
            .ToList();
    }


    // ==========================================================
    // TRAINER
    // GET RESULT BY ENROLLMENT
    // ==========================================================

    public async Task<PracticalAssessmentResultDto>
        GetResultAsync(
            Guid trainerUserId,
            Guid enrollmentId)
    {
        var result =
            await _db.PracticalAssessmentResults
                .Include(x =>
                    x.PracticalAssessment)
                .Include(x =>
                    x.Enrollment)
                    .ThenInclude(x =>
                        x.ParticipantProfile)
                .Include(x =>
                    x.CriterionScores)
                    .ThenInclude(x =>
                        x.PracticalAssessmentCriterion)
                .FirstOrDefaultAsync(
                    x =>
                        x.EnrollmentId ==
                        enrollmentId);

        if (result is null)
        {
            throw new KeyNotFoundException(
                "Practical assessment result not found.");
        }

        await EnsureTrainerAssignedAsync(
            trainerUserId,
            result.PracticalAssessment.TrainingBatchId);

        return MapResult(
            result);
    }


    // ==========================================================
    // PRIVATE
    // VALIDATION
    // ==========================================================

    private static void ValidateAssessmentRequest(
        CreatePracticalAssessmentRequest request)
    {
        if (request.TrainingBatchId == Guid.Empty)
        {
            throw new InvalidOperationException(
                "Training batch is required.");
        }

        if (string.IsNullOrWhiteSpace(
                request.Title))
        {
            throw new InvalidOperationException(
                "Assessment title is required.");
        }

        if (
            request.PassingPercentage < 0 ||
            request.PassingPercentage > 100)
        {
            throw new InvalidOperationException(
                "Passing percentage must be between 0 and 100.");
        }

        if (
            request.Criteria is null ||
            request.Criteria.Count == 0)
        {
            throw new InvalidOperationException(
                "At least one assessment criterion is required.");
        }


        var totalWeight =
            request.Criteria
                .Sum(x =>
                    x.WeightPercentage);

        if (
            Math.Abs(
                totalWeight - 100m) >
            0.01m)
        {
            throw new InvalidOperationException(
                "Criterion weights must total exactly 100%.");
        }


        var duplicateOrders =
            request.Criteria
                .GroupBy(x =>
                    x.DisplayOrder)
                .Any(g =>
                    g.Count() > 1);

        if (duplicateOrders)
        {
            throw new InvalidOperationException(
                "Criterion display orders must be unique.");
        }


        var duplicateNames =
            request.Criteria
                .GroupBy(x =>
                    x.Name
                        .Trim()
                        .ToLower())
                .Any(g =>
                    g.Count() > 1);

        if (duplicateNames)
        {
            throw new InvalidOperationException(
                "Criterion names must be unique.");
        }


        foreach (
            var criterion
            in request.Criteria)
        {
            if (
                string.IsNullOrWhiteSpace(
                    criterion.Name))
            {
                throw new InvalidOperationException(
                    "Criterion name is required.");
            }

            if (
                criterion.WeightPercentage < 0 ||
                criterion.WeightPercentage > 100)
            {
                throw new InvalidOperationException(
                    $"Weight for '{criterion.Name}' must be between 0 and 100.");
            }
        }
    }


    private static void ValidateAssessmentCanBePublished(
        PracticalAssessment assessment)
    {
        if (string.IsNullOrWhiteSpace(
                assessment.Title))
        {
            throw new InvalidOperationException(
                "Assessment title is required.");
        }

        if (
            assessment.Criteria is null ||
            assessment.Criteria.Count == 0)
        {
            throw new InvalidOperationException(
                "At least one assessment criterion is required before publishing.");
        }

        var totalWeight =
            assessment.Criteria.Sum(
                x => x.WeightPercentage);

        if (
            Math.Abs(
                totalWeight - 100m) >
            0.01m)
        {
            throw new InvalidOperationException(
                "Criterion weights must total exactly 100% before publishing.");
        }

        if (
            assessment.PassingPercentage < 0 ||
            assessment.PassingPercentage > 100)
        {
            throw new InvalidOperationException(
                "Passing percentage must be between 0 and 100.");
        }
    }


    private async Task EnsureTrainerAssignedAsync(
        Guid trainerUserId,
        Guid trainingBatchId)
    {
        var trainerProfileId =
            await _db.TrainerProfiles
                .Where(x =>
                    x.UserId ==
                    trainerUserId)
                .Select(x => x.Id)
                .FirstOrDefaultAsync();

        if (trainerProfileId == Guid.Empty)
        {
            throw new KeyNotFoundException(
                "Trainer profile not found.");
        }

        var isAssigned =
            await _db.TrainerAssignments
                .AnyAsync(x =>
                    x.TrainingBatchId ==
                        trainingBatchId &&
                    x.TrainerProfileId ==
                        trainerProfileId &&
                    x.IsActive);

        if (!isAssigned)
        {
            throw new UnauthorizedAccessException(
                "You are not assigned to this training batch.");
        }
    }


    // ==========================================================
    // PRIVATE
    // GET RESULT INTERNAL
    // ==========================================================

    private async Task<PracticalAssessmentResultDto>
        GetResultInternalAsync(
            Guid resultId)
    {
        var result =
            await _db.PracticalAssessmentResults
                .AsNoTracking()
                .Include(x =>
                    x.PracticalAssessment)
                .Include(x =>
                    x.Enrollment)
                    .ThenInclude(x =>
                        x.ParticipantProfile)
                .Include(x =>
                    x.CriterionScores)
                    .ThenInclude(x =>
                        x.PracticalAssessmentCriterion)
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        resultId);

        if (result is null)
        {
            throw new KeyNotFoundException(
                "Practical assessment result not found.");
        }

        return MapResult(
            result);
    }


    // ==========================================================
    // MAPPING
    // ==========================================================

    private static PracticalAssessmentDto
        MapAssessment(
            PracticalAssessment assessment)
    {
        return new PracticalAssessmentDto
        {
            Id =
                assessment.Id,

            TrainingBatchId =
                assessment.TrainingBatchId,

            Title =
                assessment.Title,

            Description =
                assessment.Description,

            PassingPercentage =
                assessment.PassingPercentage,

            IsPublished =
                assessment.IsPublished,

            CreatedAt =
                assessment.CreatedAt,

            UpdatedAt =
                assessment.UpdatedAt,

            Criteria =
                assessment.Criteria
                    .OrderBy(x =>
                        x.DisplayOrder)
                    .Select(x =>
                        new PracticalAssessmentCriterionDto
                        {
                            Id =
                                x.Id,

                            Name =
                                x.Name,

                            Description =
                                x.Description,

                            WeightPercentage =
                                x.WeightPercentage,

                            DisplayOrder =
                                x.DisplayOrder
                        })
                    .ToList()
        };
    }

private PracticalAssessmentResultDto MapResult(
    PracticalAssessmentResult result)
{
    var participantName =
        result.Enrollment?.ParticipantProfile != null
            ? string.Join(
                " ",
                new[]
                {
                    result.Enrollment.ParticipantProfile.FirstName,
                    result.Enrollment.ParticipantProfile.MiddleName,
                    result.Enrollment.ParticipantProfile.LastName
                }
                .Where(x => !string.IsNullOrWhiteSpace(x))
            )
            .Trim()
            : "Unknown Participant";

    return new PracticalAssessmentResultDto
    {
        Id = result.Id,

        PracticalAssessmentId =
            result.PracticalAssessmentId,

        EnrollmentId =
            result.EnrollmentId,

        ParticipantName =
            string.IsNullOrWhiteSpace(
                participantName)
                ? "Unknown Participant"
                : participantName,

        AssessmentTitle =
            result.PracticalAssessment?.Title
            ?? "Practical Assessment",

        TotalScore =
            result.TotalScore,

        Percentage =
            result.Percentage,

        IsPassed =
            result.IsPassed,

        TrainerRemarks =
            result.TrainerRemarks,

        EvaluatedByUserId =
            result.EvaluatedByUserId,

        EvaluatedAt =
            result.EvaluatedAt,

        CriterionScores =
            result.CriterionScores?
                .Where(x =>
                    x != null)
                .OrderBy(x =>
                    x.PracticalAssessmentCriterion
                        != null
                        ? x.PracticalAssessmentCriterion.DisplayOrder
                        : int.MaxValue)
                .Select(x =>
                    new PracticalAssessmentCriterionScoreDto
                    {
                        CriterionId =
                            x.PracticalAssessmentCriterionId,

                        CriterionName =
                            x.PracticalAssessmentCriterion
                                ?.Name
                            ?? "Unknown Criterion",

                        WeightPercentage =
                            x.PracticalAssessmentCriterion
                                ?.WeightPercentage
                            ?? 0,

                        Score =
                            x.Score,

                        WeightedScore =
                            x.PracticalAssessmentCriterion != null
                                ? x.Score *
                                  (
                                      x.PracticalAssessmentCriterion
                                          .WeightPercentage / 100m
                                  )
                                : 0
                    })
                .ToList()
            ?? new List<PracticalAssessmentCriterionScoreDto>()
    };
}


    private static string BuildParticipantName(
        object participant)
    {
        // This method will be replaced below if the
        // ParticipantProfile property names differ.
        return participant.ToString()
            ?? "Participant";
    }


    private static string? NormalizeNullable(
        string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return value.Trim();
    }
}