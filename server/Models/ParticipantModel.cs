

namespace server.Models
{
   public class ParticipantModel
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }


    public UserModel User { get; set; } = null!;


    public string? ProfileImage { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string? MiddleName { get; set; }

    public string LastName { get; set; } = string.Empty;

    public DateOnly DateOfBirth { get; set; }

    public string Gender { get; set; } = string.Empty;

    public string CivilStatus { get; set; } = string.Empty;

    public string MobileNumber { get; set; } = string.Empty;


    public string HomeAddress { get; set; } = string.Empty;
     public string? EmergencyContactName { get; set; }

    public string? EmergencyRelationship { get; set; }

    public string? EmergencyContactNumber { get; set; }

    public bool IsActive { get; set; } = true;


    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
}