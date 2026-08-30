using Microsoft.AspNetCore.Http;

using server.DTOs.Trainer;

namespace server.Services.Interfaces;

public interface ITrainerApplicationService
{
    // =========================================================
    // APPLICATION
    // =========================================================

    Task<TrainerApplicationDto?>
        GetMyApplicationAsync(
            Guid userId
        );

    Task<TrainerApplicationDto?>
        GetByIdAsync(
            Guid id
        );

    // =========================================================
    // ADMIN - GET ALL APPLICATIONS
    // =========================================================

    Task<List<TrainerApplicationDto>>
        GetAllAsync();


    // =========================================================
    // UPDATE MY APPLICATION
    // =========================================================

    Task<TrainerApplicationDto?>
        UpdateMyApplicationAsync(
            Guid userId,
            UpdateTrainerApplicationRequest request
        );


    // =========================================================
    // PROFILE IMAGE
    // =========================================================

    Task<TrainerApplicationDto?>
        UpdateProfileImageAsync(
            Guid userId,
            IFormFile profileImage
        );


    // =========================================================
    // DOCUMENTS
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
    // ADMIN REVIEW
    // =========================================================

    Task ReviewAsync(
        Guid applicationId,
        Guid adminId,
        ReviewTrainerApplicationRequest request
    );

    Task ReviewDocumentAsync(
        Guid applicationId,
        Guid documentId,
        Guid adminId,
        ReviewTrainerApplicationDocumentRequest request
    );
}