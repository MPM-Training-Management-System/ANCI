namespace server.DTOs.User
{
    public class UserApplicationResponseDTO
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        // ==========================================
        // USER
        // ==========================================

        public string UserIdNumber { get; set; } =
            string.Empty;

        public string Username { get; set; } =
            string.Empty;

        public string Email { get; set; } =
            string.Empty;

        public string Role { get; set; } =
            string.Empty;

        // ==========================================
        // NAME
        // ==========================================

        public string FirstName { get; set; } =
            string.Empty;

        public string? MiddleName { get; set; }

        public string LastName { get; set; } =
            string.Empty;

        public string FullName { get; set; } =
            string.Empty;

        // ==========================================
        // PROFILE
        // ==========================================

        public string? ProfileImage { get; set; }

        // ==========================================
        // APPLICATION
        // ==========================================

        public string Status { get; set; } =
            "Pending";

        public string PolicyStatus { get; set; } =
            "Pending";

        public string? PolicyRemarks { get; set; }

        // ==========================================
        // DATE
        // ==========================================

        public DateTime SubmittedAt { get; set; }

        // ==========================================
        // ACCOUNT
        // ==========================================

        public bool IsActive { get; set; }

        public bool IsEmailVerified { get; set; }
    }
}