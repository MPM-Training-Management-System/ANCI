using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Training;
using server.Models.Training;
using server.Services.Interfaces;

namespace server.Services.Training;

public class TrainingProgramDocumentService
    : ITrainingProgramDocumentService
{
    private readonly ApplicationDbContext _context;
    private readonly ICloudinaryService _cloudinary;

    public TrainingProgramDocumentService(
        ApplicationDbContext context,
        ICloudinaryService cloudinary)
    {
        _context = context;
        _cloudinary = cloudinary;
    }


    // =========================================================
    // GET ALL DOCUMENTS
    // =========================================================

    public async Task<List<TrainingProgramDocumentDto>> GetAllAsync(
        Guid trainingProgramId)
    {
        var programExists =
            await _context.TrainingPrograms
                .AnyAsync(
                    x => x.Id == trainingProgramId
                );

        if (!programExists)
        {
            throw new KeyNotFoundException(
                "Training program not found."
            );
        }

        return await _context
            .TrainingProgramDocuments
            .AsNoTracking()
            .Where(
                x =>
                    x.TrainingProgramId
                    == trainingProgramId
            )
            .OrderByDescending(
                x => x.UploadedAt
            )
            .Select(
                x =>
                    new TrainingProgramDocumentDto(
                        x.Id,
                        x.TrainingProgramId,
                        x.DocumentName,
                        x.FileUrl,
                        x.UploadedAt
                    )
            )
            .ToListAsync();
    }


    // =========================================================
    // UPLOAD
    // =========================================================

    public async Task<TrainingProgramDocumentDto> UploadAsync(
        Guid trainingProgramId,
        UploadTrainingProgramDocumentRequest request)
    {
        var program =
            await _context.TrainingPrograms
                .FirstOrDefaultAsync(
                    x => x.Id == trainingProgramId
                );

        if (program == null)
        {
            throw new KeyNotFoundException(
                "Training program not found."
            );
        }

        if (request.File == null)
        {
            throw new ArgumentException(
                "Document file is required."
            );
        }

        if (request.File.Length == 0)
        {
            throw new ArgumentException(
                "Document file cannot be empty."
            );
        }


        await using var stream =
            request.File.OpenReadStream();


        var folder =
            $"ace-nextgen/training-programs/{trainingProgramId}/documents";


        var uploadResult =
            await _cloudinary.UploadDocumentAsync(
                stream,
                request.File.FileName,
                folder
            );


        var document =
            new TrainingProgramDocument
            {
                Id = Guid.NewGuid(),

                TrainingProgramId =
                    trainingProgramId,

                DocumentName =
                    request.File.FileName,

                

                FileUrl =
                    uploadResult.Url,

                PublicId =
                    uploadResult.PublicId,

                UploadedAt =
                    DateTime.UtcNow
            };


        _context
            .TrainingProgramDocuments
            .Add(document);


        await _context.SaveChangesAsync();


        return new TrainingProgramDocumentDto(
            document.Id,
            document.TrainingProgramId,
            document.DocumentName,
            document.FileUrl,
            document.UploadedAt
        );
    }


    // =========================================================
    // DELETE
    // =========================================================

    public async Task DeleteAsync(
        Guid trainingProgramId,
        Guid documentId)
    {
        var document =
            await _context
                .TrainingProgramDocuments
                .FirstOrDefaultAsync(
                    x =>
                        x.Id == documentId &&
                        x.TrainingProgramId
                            == trainingProgramId
                );

        if (document == null)
        {
            throw new KeyNotFoundException(
                "Training program document not found."
            );
        }


        if (!string.IsNullOrWhiteSpace(
            document.PublicId))
        {
            await _cloudinary
                .DeleteDocumentAsync(
                    document.PublicId
                );
        }


        _context
            .TrainingProgramDocuments
            .Remove(document);


        await _context.SaveChangesAsync();
    }
}