using System.ComponentModel.DataAnnotations;

namespace server.DTOs.TrainingSchedule
{
    public class CreateTrainingScheduleDto
    {
        [Required]
        public Guid TrainingProgramId { get; set; }

        [Required]
        public Guid? TrainerId { get; set; }

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