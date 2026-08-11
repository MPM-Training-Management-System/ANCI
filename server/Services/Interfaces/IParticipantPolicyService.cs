namespace server.Services.Interfaces
{
    public interface IParticipantPolicyService
    {
        Task<(bool Passed, string Remarks)> CheckAsync(
            Guid userId);
    }
}