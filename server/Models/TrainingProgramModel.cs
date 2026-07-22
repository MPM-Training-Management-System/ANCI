using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Models
{
    public class TrainingProgramModel
    {
        [Key]
        public int Id { get; set; }

        public string ProgramCode { get; set; } = string.Empty;

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Category { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Objectives { get; set; } = string.Empty;

        public string Venue { get; set; } = string.Empty;

        public int MaxParticipants { get; set; }

        public int TrainerId { get; set; }

        [ForeignKey(nameof(TrainerId))]
        public UserModel Trainer { get; set; } = null!;

        public string? Thumbnail { get; set; }

        public string Status { get; set; } = "Draft";

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}