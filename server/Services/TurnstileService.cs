using System.Text.Json;
using Microsoft.Extensions.Options;
using server.Services.Interfaces;
using server.Settings;

namespace server.Services;

public class TurnstileService : ITurnstileService
{
    private readonly HttpClient _httpClient;
    private readonly TurnstileSettings _settings;
    private readonly ILogger<TurnstileService> _logger;

    public TurnstileService(
        HttpClient httpClient,
        IOptions<TurnstileSettings> settings,
        ILogger<TurnstileService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<bool> VerifyAsync(string token)
    {
        if (string.IsNullOrWhiteSpace(token) ||
            string.IsNullOrWhiteSpace(_settings.SecretKey))
        {
            return false;
        }

        try
        {
            using var content = new FormUrlEncodedContent(
                new Dictionary<string, string>
                {
                    ["secret"] = _settings.SecretKey,
                    ["response"] = token
                });

            using var response = await _httpClient.PostAsync(
                _settings.VerifyUrl,
                content);

            if (!response.IsSuccessStatusCode)
                return false;

            var json = await response.Content.ReadAsStringAsync();

            var result = JsonSerializer.Deserialize<TurnstileResponse>(
                json,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

            return result?.Success == true;
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Cloudflare Turnstile verification failed.");

            return false;
        }
    }

    private sealed class TurnstileResponse
    {
        public bool Success { get; set; }
    }
}