using server.DTOs.Admin.Recovery;

namespace server.Services.Interfaces;

public interface IUserRecoveryService
{
    Task<IReadOnlyList<RecoveryUserListItemDto>> SearchAsync(
        string? search,
        CancellationToken cancellationToken = default
    );

    Task<RecoveryUserDetailsDto?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );

    Task<RecoveryRestoreResultDto> RestoreAsync(
        Guid id,
        CancellationToken cancellationToken = default
    );
}