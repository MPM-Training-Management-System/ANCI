namespace server.Models
{
    public class OtpCodeModel
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public string CodeHash { get; set; } = string.Empty;

        public string Purpose { get; set; } = "EmailVerification";

        public DateTime ExpiresAt { get; set; }

        public bool IsUsed { get; set; } = false;

        public int Attempts { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UsedAt { get; set; }

        // Navigation Property
        public UserModel? User { get; set; }
    }
}