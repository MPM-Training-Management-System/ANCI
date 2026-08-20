using server.Enums;
using server.Models.Auth;

namespace server.Models.Otp;

public class OtpVerification
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string OtpCode { get; set; } = string.Empty;

    public OtpPurpose Purpose { get; set; }

    public DateTime ExpiresAt { get; set; }

    public bool IsUsed { get; set; }

    public DateTime? VerifiedAt { get; set; }

    public int AttemptCount { get; set; }

    public DateTime CreatedAt { get; set; }

    public User User { get; set; } = null!;
}