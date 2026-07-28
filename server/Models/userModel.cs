namespace server.Models
{
    public class UserModel
    {
        public Guid Id { get; set; }
        
        public string UserId { get; set; } = string.Empty;
        public string Username {get; set;} = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string Fullname { get; set; } = string.Empty;

        public string Role { get; set; } = "Participant";

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Property
        public ParticipantModel? Participant { get; set; }
    }
}