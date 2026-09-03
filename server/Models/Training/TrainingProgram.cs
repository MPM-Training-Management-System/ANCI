
using System.ComponentModel.DataAnnotations;
namespace server.Models.Training;
public class TrainingProgram
{
    public Guid Id { get; set;}
    public string ProgramCode { get; set;} = default!;

    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public int DurationHours { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }

     public ICollection<TrainingBatch> Batches { get; set; } = [];

     public ICollection<TrainingProgramDocument> Documents { get; set; }
    = new List<TrainingProgramDocument>();


public ICollection<TrainingProgramRequirement> Requirements { get; set; }
    = new List<TrainingProgramRequirement>();
    
}