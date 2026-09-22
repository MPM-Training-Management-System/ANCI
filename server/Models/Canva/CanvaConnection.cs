using System.ComponentModel.DataAnnotations;

namespace server.Models.Canva;

public class CanvaConnection
{
    public Guid Id { get; set; }

    [Required]
    public string AccessToken { get; set; } = string.Empty;

    [Required]
    public string RefreshToken { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    [MaxLength(1000)]
    public string? Scope { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}