namespace server.DTOs.TrainingProgram
{
    public class TrainingProgramResponseDto
    {
        public int Id { get; set; }

        public string ProgramCode { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;

        public string Category { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Objectives { get; set; } = string.Empty;

        public string Venue { get; set; } = string.Empty;

        public int MaxParticipants { get; set; }

        public int TrainerId { get; set; }

        public string TrainerName { get; set; } = string.Empty;

        public string? Thumbnail { get; set; }

        public string Status { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }
    }
}