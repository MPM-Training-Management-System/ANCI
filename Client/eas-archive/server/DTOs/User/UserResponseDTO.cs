namespace server.DTOs.User
{
    public class UserResponseDTO
{
        public Guid Id { get; set; }

        public string UserId { get; set; } = string.Empty;

        public string Username { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Fullname { get; set; } = string.Empty;

        public string Role { get; set; } = string.Empty;

        public string? ProfileImage { get; set; } 

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; }
}
}