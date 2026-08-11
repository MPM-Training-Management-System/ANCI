namespace server.Models
{
    public enum ApplicationStatus
    {
        Pending,
        Approved,
        Rejected
    }

    public enum PolicyStatus
    {
        Pending,
        Passed,
        Failed
    }

    public class ParticipantApplicationModel
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public UserModel User { get; set; } = null!;

        // Application status
        public ApplicationStatus Status { get; set; }
            = ApplicationStatus.Pending;

        // Automatic policy checking
        public PolicyStatus PolicyStatus { get; set; }
            = PolicyStatus.Pending;

        public string? PolicyRemarks { get; set; }

        // Admin review
        public Guid? ReviewedBy { get; set; }

        public DateTime? ReviewedAt { get; set; }

        public string? RejectionReason { get; set; }

        public DateTime SubmittedAt { get; set; }
            = DateTime.UtcNow;
    }
}