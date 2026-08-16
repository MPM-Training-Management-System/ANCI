namespace server.DTOs.User
{
    public class UserApplicationDetailsDTO
    {
        // ==========================================
        // APPLICATION
        // ==========================================

        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public string UserIdNumber { get; set; } =
            string.Empty;

        public string Status { get; set; } =
            "Pending";

        public string PolicyStatus { get; set; } =
            "Pending";

        public string? PolicyRemarks { get; set; }

        public Guid? ReviewedBy { get; set; }

        public DateTime? ReviewedAt { get; set; }

        public string? RejectionReason { get; set; }

        public DateTime SubmittedAt { get; set; }

        // ==========================================
        // USER
        // ==========================================

        public string Username { get; set; } =
            string.Empty;

        public string Email { get; set; } =
            string.Empty;

        public string Role { get; set; } =
            string.Empty;

        public bool IsActive { get; set; }

        public bool IsEmailVerified { get; set; }

        // ==========================================
        // PERSONAL INFORMATION
        // ==========================================

        public string FirstName { get; set; } =
            string.Empty;

        public string? MiddleName { get; set; }

        public string LastName { get; set; } =
            string.Empty;

        public string FullName { get; set; } =
            string.Empty;

        public DateOnly? DateOfBirth { get; set; }

        public string Gender { get; set; } =
            string.Empty;

        public string CivilStatus { get; set; } =
            string.Empty;

        // ==========================================
        // CONTACT
        // ==========================================

        public string MobileNumber { get; set; } =
            string.Empty;

        public string HomeAddress { get; set; } =
            string.Empty;

        // ==========================================
        // EMERGENCY CONTACT
        // PARTICIPANT
        // ==========================================

        public string? EmergencyContactName { get; set; }

        public string? EmergencyRelationship { get; set; }

        public string? EmergencyContactNumber { get; set; }

        // ==========================================
        // TRAINER INFORMATION
        // ==========================================

        public string? Expertise { get; set; }

        public int? YearsOfExperience { get; set; }

        public string? Organization { get; set; }

        public string? Biography { get; set; }

        // ==========================================
        // DOCUMENTS
        // ==========================================

        public string? ProfileImage { get; set; }

        public string? ValidId { get; set; }
    }
}