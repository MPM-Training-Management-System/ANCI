using server.DTOs.Admin.Recovery;

namespace server.Services.Interfaces;

public interface IRecoveryRecordSearchService
{
    Task<RecoveryRecordSearchResultDto> SearchAsync(
        string module,
        string entityName,
        string? search,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default
    );
}