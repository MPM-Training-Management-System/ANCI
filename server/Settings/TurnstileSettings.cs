namespace server.Settings;

public class TurnstileSettings
{
    public string SecretKey { get; set; } = string.Empty;
    public string VerifyUrl { get; set; } =
        "https://challenges.cloudflare.com/turnstile/v0/siteverify";
}