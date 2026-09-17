namespace server.Settings;

public class EmailSettings
{
    public string Host { get; set; } = string.Empty;

    public int Port { get; set; }

    public string Username { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string FromEmail { get; set; } = string.Empty;

    public string FromName { get; set; } = string.Empty;

     public bool EnableSsl { get; set; } = true;

    public string LogoUrl { get; set; } = string.Empty;

    public string AppDownloadUrl { get; set; } = string.Empty;
}