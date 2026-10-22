
using server.DTOs.Admin.Recovery;

namespace server.Services.Interfaces;

public interface IFullUserRecoveryService
{
    Task<FullUserRecoveryPreviewDto> PreviewAsync(
        string userCode,
        CancellationToken cancellationToken = default
    );

    Task<FullUserRecoveryResultDto> RestoreAsync(
        string userCode,
        CancellationToken cancellationToken = default
    );
}
