using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Enrollment;
using server.Enums;
using server.Services.Interfaces;

namespace server.Services.Enrollment;

public class EnrollmentService : IEnrollmentService
{
    private readonly ApplicationDbContext _context;

    public EnrollmentService(
        ApplicationDbContext context)
    {
        _context = context;
    }


    // =========================================================
    // CREATE ENROLLMENT
    //
    // PARTICIPANT
    // =========================================================

   public async Task<EnrollmentDto> CreateAsync(
    Guid participantUserId,
    CreateEnrollmentRequest request)
{
    // -----------------------------------------------------
    // FIND PARTICIPANT PROFILE + USER
    // -----------------------------------------------------

    var participant =
        await _context.ParticipantProfiles
            .Include(x =>
                x.User)
            .FirstOrDefaultAsync(
                x =>
                    x.UserId ==
                    participantUserId
            );

    if (participant is null)
    {
        throw new KeyNotFoundException(
            "Participant profile not found."
        );
    }


    // -----------------------------------------------------
    // CHECK ACTIVE ENROLLMENT
    //
    // A participant can only have one active
    // training enrollment at a time.
    // -----------------------------------------------------

    var hasActiveEnrollment =
        await _context.Enrollments
            .AnyAsync(
                x =>
                    x.ParticipantProfileId ==
                        participant.Id &&

                    (
                        x.Status ==
                            EnrollmentStatus.Pending ||

                        x.Status ==
                            EnrollmentStatus.DocumentsRequired ||

                        x.Status ==
                            EnrollmentStatus.UnderReview ||

                        x.Status ==
                            EnrollmentStatus.NeedsCorrection ||

                        x.Status ==
                            EnrollmentStatus.Approved
                    )
            );

    if (hasActiveEnrollment)
    {
        throw new InvalidOperationException(
            "You already have an active training enrollment. " +
            "You can enroll again after your current training is completed, rejected, or cancelled."
        );
    }


    // -----------------------------------------------------
    // FIND TRAINING BATCH
    // -----------------------------------------------------

    var batch =
        await _context.TrainingBatches
            .Include(x =>
                x.TrainingProgram)
            .Include(x =>
                x.Enrollments)
            .FirstOrDefaultAsync(
                x =>
                    x.Id ==
                    request.TrainingBatchId
            );

    if (batch is null)
    {
        throw new KeyNotFoundException(
            "Training batch not found."
        );
    }


    // -----------------------------------------------------
    // BATCH MUST BE PUBLISHED
    // -----------------------------------------------------

    if (
        batch.Status !=
        TrainingStatus.Published
    )
    {
        throw new InvalidOperationException(
            "This training batch is not available for enrollment."
        );
    }


    // -----------------------------------------------------
    // CHECK CAPACITY
    //
    // Rejected and Cancelled do not occupy a slot.
    // -----------------------------------------------------

    var enrolledCount =
        batch.Enrollments.Count(
            x =>
                x.Status !=
                    EnrollmentStatus.Rejected &&

                x.Status !=
                    EnrollmentStatus.Cancelled
        );

    if (
        enrolledCount >=
        batch.Capacity
    )
    {
        throw new InvalidOperationException(
            "Training batch is already full."
        );
    }


    // -----------------------------------------------------
    // CHECK DUPLICATE ENROLLMENT
    //
    // Prevent duplicate enrollment in the same batch
    // except when the previous application was Rejected
    // or Cancelled.
    //
    // Completed remains in history and cannot be
    // submitted again to the same batch.
    // -----------------------------------------------------

    var existingEnrollment =
        await _context.Enrollments
            .AnyAsync(
                x =>
                    x.ParticipantProfileId ==
                        participant.Id &&

                    x.TrainingBatchId ==
                        request.TrainingBatchId &&

                    x.Status !=
                        EnrollmentStatus.Rejected &&

                    x.Status !=
                        EnrollmentStatus.Cancelled
            );

    if (existingEnrollment)
    {
        throw new InvalidOperationException(
            "Participant already has an enrollment for this training batch."
        );
    }


    // -----------------------------------------------------
    // CREATE ENROLLMENT
    // -----------------------------------------------------

    var enrollment =
        new server.Models.Participant.Enrollment
        {
            Id =
                Guid.NewGuid(),

            ParticipantProfileId =
                participant.Id,

            TrainingBatchId =
                batch.Id,

            Status =
                EnrollmentStatus.Pending,

            EnrolledAt =
                DateTime.UtcNow,

            ApprovedAt =
                null,

            ReviewedByUserId =
                null,

            ReviewRemarks =
                null
        };


    _context.Enrollments.Add(
        enrollment
    );

    await _context.SaveChangesAsync();


    // -----------------------------------------------------
    // RETURN DTO
    // -----------------------------------------------------

    return MapToDto(
        enrollment,
        participant,
        batch,
        []
    );
}

    // =========================================================
    // GET MY ENROLLMENTS
    //
    // PARTICIPANT
    // =========================================================

    public async Task<IEnumerable<EnrollmentDto>>
        GetMyEnrollmentsAsync(
            Guid participantUserId)
    {
        var enrollments =
            await _context.Enrollments
                .AsNoTracking()

                .Include(x =>
                    x.ParticipantProfile)
                    .ThenInclude(x =>
                        x.User)

                .Include(x =>
                    x.TrainingBatch)
                    .ThenInclude(x =>
                        x.TrainingProgram)

                .Include(x =>
                    x.Documents)
                    .ThenInclude(x =>
                        x.Requirement)

                .Where(
                    x =>
                        x.ParticipantProfile.UserId ==
                        participantUserId
                )

                .OrderByDescending(
                    x =>
                        x.EnrolledAt
                )

                .ToListAsync();


        return enrollments.Select(
            x =>
                MapToDto(
                    x,
                    x.ParticipantProfile,
                    x.TrainingBatch,
                    x.Documents
                )
        );
    }


    // =========================================================
    // GET ENROLLMENT BY ID
    //
    // PARTICIPANT
    // =========================================================

    public async Task<EnrollmentDto?>
        GetByIdAsync(
            Guid enrollmentId,
            Guid userId)
    {
        var enrollment =
            await _context.Enrollments
                .AsNoTracking()

                .Include(x =>
                    x.ParticipantProfile)
                    .ThenInclude(x =>
                        x.User)

                .Include(x =>
                    x.TrainingBatch)
                    .ThenInclude(x =>
                        x.TrainingProgram)

                .Include(x =>
                    x.Documents)
                    .ThenInclude(x =>
                        x.Requirement)

                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        enrollmentId
                );


        if (enrollment is null)
        {
            return null;
        }


        // -----------------------------------------------------
        // OWNER CHECK
        // -----------------------------------------------------

        if (
            enrollment
                .ParticipantProfile
                .UserId !=
            userId
        )
        {
            throw new UnauthorizedAccessException(
                "You are not allowed to access this enrollment."
            );
        }


        // -----------------------------------------------------
        // RETURN DTO
        // -----------------------------------------------------

        return MapToDto(
            enrollment,
            enrollment.ParticipantProfile,
            enrollment.TrainingBatch,
            enrollment.Documents
        );
    }


    // =========================================================
    // GET PENDING ENROLLMENTS
    //
    // ADMIN
    // =========================================================

   public async Task<IEnumerable<EnrollmentDto>>
    GetAllForAdminAsync()
{
    var enrollments =
        await _context.Enrollments
            .AsNoTracking()

            .Include(x =>
                x.ParticipantProfile)
                .ThenInclude(x =>
                    x.User)

            .Include(x =>
                x.TrainingBatch)
                .ThenInclude(x =>
                    x.TrainingProgram)

            .Include(x =>
                x.Documents)
                .ThenInclude(x =>
                    x.Requirement)

            .OrderByDescending(
                x =>
                    x.EnrolledAt
            )

            .ToListAsync();


    return enrollments.Select(
        x =>
            MapToDto(
                x,
                x.ParticipantProfile,
                x.TrainingBatch,
                x.Documents
            )
    );
}

    // =========================================================
    // REVIEW ENROLLMENT
    //
    // ADMIN
    // =========================================================

    public async Task ReviewAsync(
        Guid enrollmentId,
        Guid adminUserId,
        ReviewEnrollmentRequest request)
    {
        // -----------------------------------------------------
        // FIND ENROLLMENT
        // -----------------------------------------------------

        var enrollment =
            await _context.Enrollments
                .FirstOrDefaultAsync(
                    x =>
                        x.Id ==
                        enrollmentId
                );


        if (enrollment is null)
        {
            throw new KeyNotFoundException(
                "Enrollment not found."
            );
        }


        // -----------------------------------------------------
        // VALIDATE DECISION
        // -----------------------------------------------------

        var decision =
            request.Decision
                .Trim()
                .ToLower();


        if (
            decision != "approved" &&
            decision != "rejected" &&
            decision != "needscorrection"
        )
        {
            throw new ArgumentException(
                "Invalid enrollment decision."
            );
        }


        // -----------------------------------------------------
        // APPLY DECISION
        // -----------------------------------------------------

        enrollment.Status =
            decision switch
            {
                "approved" =>
                    EnrollmentStatus.Approved,

                "rejected" =>
                    EnrollmentStatus.Rejected,

                "needscorrection" =>
                    EnrollmentStatus.NeedsCorrection,

                _ =>
                    throw new ArgumentException(
                        "Invalid enrollment decision."
                    )
            };


        // -----------------------------------------------------
        // REVIEW REMARKS
        // -----------------------------------------------------

        enrollment.ReviewRemarks =
            request.Remarks;


        // -----------------------------------------------------
        // REVIEWED BY
        // -----------------------------------------------------

        enrollment.ReviewedByUserId =
            adminUserId;


        // -----------------------------------------------------
        // APPROVED DATE
        // -----------------------------------------------------

       if (
    enrollment.Status ==
    EnrollmentStatus.Approved
)
{
    enrollment.ApprovedAt =
        DateTime.UtcNow;

     enrollment.AttendanceToken ??= GenerateAttendanceToken();

    if (
        string.IsNullOrWhiteSpace(
            enrollment.AttendanceToken
        )
    )
    {
        enrollment.AttendanceToken =
            Guid.NewGuid()
                .ToString("N");
    }
}
else
{
    enrollment.ApprovedAt =
        null;
}


        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        await _context.SaveChangesAsync();
    }


    // =========================================================
    // MAP ENROLLMENT TO DTO
    // =========================================================

    private static EnrollmentDto MapToDto(
        server.Models.Participant.Enrollment enrollment,
        server.Models.Participant.ParticipantProfile participant,
        server.Models.Training.TrainingBatch batch,
        IEnumerable<server.Models.Participant.EnrollmentDocument> documents)
    {
        var user =
            participant.User;


        var participantDto =
            new EnrollmentParticipantDto(
                participant.Id,

                participant.UserId,

                user.UserCode,

                user.FullName,

                user.Email,

                user.MobileNumber,

                participant.ProfileImageUrl
            );


        var documentDtos =
            documents
                .Select(
                    document =>
                        new EnrollmentDocumentDto(
                            document.Id,
                            document.RequirementId,

                            document.Requirement.Name,

                            

                            document.FileName,

                            document.FileUrl,

                            document.Status.ToString(),

                            document.ReviewRemarks
                        )
                )
                .ToList();


        return new EnrollmentDto(
            enrollment.Id,

            enrollment.ParticipantProfileId,

            participantDto,

            enrollment.TrainingBatchId,

            batch.TrainingProgram.Name,

            batch.BatchCode,

            enrollment.Status.ToString(),

            enrollment.EnrolledAt,

            enrollment.ApprovedAt,

            enrollment.ReviewRemarks,
             enrollment.AttendanceToken,

            documentDtos
        );
    }
    private static string GenerateAttendanceToken()
{
    return Convert.ToBase64String(
        System.Security.Cryptography.RandomNumberGenerator.GetBytes(32)
    );
}
}