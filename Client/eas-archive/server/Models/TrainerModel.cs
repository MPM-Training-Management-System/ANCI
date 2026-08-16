namespace server.Models
{
    public class TrainerModel
    {
        public Guid Id { get; set; }

        // ==========================================
        // USER ACCOUNT
        // ==========================================

        public Guid UserId { get; set; }

        public UserModel User { get; set; } = null!;

        public bool IsActive { get; set; } = true;

        // ==========================================
        // PERSONAL INFORMATION
        // ==========================================

        public string FirstName { get; set; } =
            string.Empty;

        public string? MiddleName { get; set; }

        public string LastName { get; set; } =
            string.Empty;

        public DateOnly DateOfBirth { get; set; }

        public string Gender { get; set; } =
            string.Empty;

        public string CivilStatus { get; set; } =
            string.Empty;

        // ==========================================
        // CONTACT INFORMATION
        // ==========================================

        public string MobileNumber { get; set; } =
            string.Empty;

        public string HomeAddress { get; set; } =
            string.Empty;

        // ==========================================
        // PROFESSIONAL INFORMATION
        // ==========================================

        public string Expertise { get; set; } =
            string.Empty;

        public int YearsOfExperience { get; set; }

        public string Organization { get; set; } =
            string.Empty;

        public string Biography { get; set; } =
            string.Empty;

        // ==========================================
        // VERIFICATION
        // ==========================================

        public string? ProfileImage { get; set; }

        public string? ValidId { get; set; }

        // ==========================================
        // REGISTRATION
        // ==========================================

        public bool IsProfileCompleted { get; set; } =
            false;

        // ==========================================
        // TIMESTAMP
        // ==========================================

        public DateTime CreatedAt { get; set; } =
            DateTime.UtcNow;

        // ==========================================
        // TRAINING RELATIONSHIPS
        // ==========================================

        public ICollection<TrainingAssignmentModel>
            Assignments { get; set; } =
            new List<TrainingAssignmentModel>();

        public ICollection<TrainingProgramModel>
            TrainingPrograms { get; set; } =
            new List<TrainingProgramModel>();

        public ICollection<TrainingScheduleModel>
            TrainingSchedules { get; set; } =
            new List<TrainingScheduleModel>();
    }
}