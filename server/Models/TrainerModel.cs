namespace server.Models
{
    public class TrainerModel
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public UserModel User { get; set; } = null!;

        public DateOnly DateOfBirth { get; set; }

        public string Gender { get; set; } = string.Empty;

        public string CivilStatus { get; set; } = string.Empty;

        public string MobileNumber { get; set; } = string.Empty;

        public string HomeAddress { get; set; } = string.Empty;

        public string Expertise { get; set; } = string.Empty;

        public int YearsOfExperience { get; set; }

        public string Organization { get; set; } = string.Empty;

        public string Biography { get; set; } = string.Empty;

        public string? ProfileImage { get; set; }

        public bool IsVerified { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsProfileCompleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<TrainingAssignmentModel> Assignments { get; set; }
            = new List<TrainingAssignmentModel>();

        public ICollection<TrainingProgramModel> TrainingPrograms { get; set; }
            = new List<TrainingProgramModel>();

        public ICollection<TrainingScheduleModel> TrainingSchedules { get; set; }
            = new List<TrainingScheduleModel>();
    }
}