using server.Enums;
using server.Models.Otp;
using server.Models.Participant;
using server.Models.Trainer;

namespace server.Models.Auth;

public class User
{
     public Guid Id { get; set; }

    public string UserCode { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? MobileNumber { get; set; }

    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public UserStatus Status { get; set; }

    public bool IsEmailVerified { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
    public ICollection<OtpVerification> OtpVerifications { get; set; }
    = new List<OtpVerification>();

    public ParticipantProfile? ParticipantProfile { get; set; }

public TrainerProfile? TrainerProfile { get; set; }
    public TrainerApplication? TrainerApplication { get; set; }
}