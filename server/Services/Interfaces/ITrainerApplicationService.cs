using Microsoft.AspNetCore.Http;

using server.DTOs.Trainer;

namespace server.Services.Interfaces;

public interface ITrainerApplicationService
{
    // =========================================================
    // APPLICATION
    // =========================================================

    Task<TrainerApplicationDto?>
        GetByIdAsync(
            Guid id
        );

    Task<TrainerApplicationDto?>
        GetMyApplicationAsync(
            Guid userId
        );


    // =========================================================
    // ADMIN APPLICATION REVIEW
    // =========================================================

    Task ReviewAsync(
        Guid applicationId,
        Guid adminId,
        ReviewTrainerApplicationRequest request
    );


    // =========================================================
    // ADMIN DOCUMENT REVIEW
    // =========================================================

    Task ReviewDocumentAsync(
        Guid applicationId,
        Guid documentId,
        Guid adminId,
        ReviewTrainerApplicationDocumentRequest request
    );


    // =========================================================
    // UPDATE APPLICATION PROFILE IMAGE
    // =========================================================

    Task<TrainerApplicationDto?>
        UpdateProfileImageAsync(
            Guid userId,
            IFormFile profileImage
        );


    // =========================================================
    // UPDATE APPLICATION
    // =========================================================

    Task<TrainerApplicationDto?>
        UpdateMyApplicationAsync(
            Guid userId,
            UpdateTrainerApplicationRequest request
        );


    // =========================================================
    // APPLICATION DOCUMENTS
    // =========================================================

    Task<TrainerApplicationDocumentDto>
        UploadDocumentAsync(
            Guid userId,
            Guid applicationId,
            UploadTrainerApplicationDocumentRequest request
        );


    Task<List<TrainerApplicationDocumentDto>>
        GetMyDocumentsAsync(
            Guid userId,
            Guid applicationId
        );


    Task DeleteDocumentAsync(
        Guid userId,
        Guid applicationId,
        Guid documentId
    );


    // =========================================================
    // TRAINER PROFILE
    // =========================================================

    Task<TrainerProfileDto?>
        GetMyProfileAsync(
            Guid userId
        );


    Task<TrainerProfileDto?>
        UpdateMyProfileAsync(
            Guid userId,
            UpdateTrainerProfileRequest request
        );


    Task<TrainerProfileDto?>
        GetByIdProfileAsync(
            Guid id
        );


    Task<List<TrainerProfileDto>>
        GetActiveTrainersAsync();
}