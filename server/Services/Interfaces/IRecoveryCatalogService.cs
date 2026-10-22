using server.DTOs.Admin.Recovery;

namespace server.Services.Interfaces;

public interface IRecoveryCatalogService
{
    Task<IReadOnlyList<RecoveryModuleDto>> GetModulesAsync(
        CancellationToken cancellationToken = default
    );
}