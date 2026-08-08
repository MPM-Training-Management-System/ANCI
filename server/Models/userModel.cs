namespace server.Models
{
    public class UserModel
    {
        public Guid Id { get; set; }
        
        public string UserId { get; set; } = string.Empty;
        public string Username {get; set;} = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string FirstName { get; set; }  = string.Empty;

public string? MiddleName { get; set; }

public string LastName { get; set; }  = string.Empty;

public string Fullname =>
    $"{FirstName} {MiddleName} {LastName}"
        .Replace("  ", " ")
        .Trim();

        public string Role { get; set; } = "Participant";

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Property
        public ParticipantModel? Participant { get; set; }

        public TrainerModel? Trainer { get; set; }

      
    }
}