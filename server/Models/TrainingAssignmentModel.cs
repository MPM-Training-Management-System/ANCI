using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using server.Models;

public class TrainingAssignmentModel
{
    [Key]
    public Guid Id { get; set; }

    public Guid TrainingProgramId { get; set; }

    [ForeignKey(nameof(TrainingProgramId))]
    public TrainingProgramModel TrainingProgram { get; set; } = null!;

    public Guid TrainerId { get; set; }

[ForeignKey(nameof(TrainerId))]
public TrainerModel Trainer { get; set; } = null!;

    public Guid? ApprovedBy { get; set; }

    [ForeignKey(nameof(ApprovedBy))]
    public UserModel? Admin { get; set; }

    public string Status { get; set; } = "Pending";

    public DateTime AppliedAt { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public string? Remarks { get; set; }
}