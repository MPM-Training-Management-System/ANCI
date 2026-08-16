namespace server.Models
{
  
    public enum ApplicationStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    }



    public enum PolicyStatus
    {
        Pending = 0,
        Passed = 1,
        Failed = 2
    }



    public class UserApplicationModel
    {
        public Guid Id { get; set; }


        public Guid UserId { get; set; }

        public UserModel User { get; set; } = null!;

        public ApplicationStatus Status { get; set; }
            = ApplicationStatus.Pending;

       
        public PolicyStatus PolicyStatus { get; set; }
            = PolicyStatus.Pending;

        public string? PolicyRemarks { get; set; }


        public Guid? ReviewedBy { get; set; }

        public DateTime? ReviewedAt { get; set; }

        public string? RejectionReason { get; set; }


        public DateTime SubmittedAt { get; set; }
            = DateTime.UtcNow;
    }
}