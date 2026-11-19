namespace server.Services.Interfaces;

public interface ITurnstileService
{
    Task<bool> VerifyAsync(string token);
}