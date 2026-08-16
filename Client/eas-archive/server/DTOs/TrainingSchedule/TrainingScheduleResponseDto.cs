namespace server.DTOs.TrainingSchedule
{
    public class TrainingScheduleResponseDto
    {
        public Guid Id { get; set; }

        public Guid TrainingProgramId { get; set; }

        public string TrainingTitle { get; set; } = string.Empty;

        public Guid? TrainerId { get; set; }

        public string TrainerName { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public string Venue { get; set; } = string.Empty;

        public int MaximumParticipants { get; set; }

        public int CurrentParticipants { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}