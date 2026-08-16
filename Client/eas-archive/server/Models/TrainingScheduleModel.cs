using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
    public class TrainingScheduleModel
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid TrainingProgramId { get; set; }

        [ForeignKey(nameof(TrainingProgramId))]
        public TrainingProgramModel TrainingProgram { get; set; } = null!;

        [Required]
      public Guid? TrainerId { get; set; }

[ForeignKey(nameof(TrainerId))]
public TrainerModel? Trainer { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public string Venue { get; set; } = string.Empty;

        public int MaximumParticipants { get; set; }

        public int CurrentParticipants { get; set; } = 0;

        public string Status { get; set; } = "Scheduled";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}