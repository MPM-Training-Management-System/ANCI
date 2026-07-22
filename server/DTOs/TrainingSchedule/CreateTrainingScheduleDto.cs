using System.ComponentModel.DataAnnotations;

namespace server.DTOs.TrainingSchedule
{
    public class CreateTrainingScheduleDto
    {
        [Required]
        public int TrainingProgramId { get; set; }

        [Required]
        public int TrainerId { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public string Venue { get; set; } = string.Empty;

        [Required]
        public int MaximumParticipants { get; set; }
    }
}