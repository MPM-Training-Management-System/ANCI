using server.DTOs.Training;

namespace server.Services.Interfaces;

public interface ITrainingProgramDocumentService
{
    Task<List<TrainingProgramDocumentDto>> GetAllAsync(
        Guid trainingProgramId
    );

    Task<TrainingProgramDocumentDto> UploadAsync(
        Guid trainingProgramId,
        UploadTrainingProgramDocumentRequest request
    );

    Task DeleteAsync(
        Guid trainingProgramId,
        Guid documentId
    );
}