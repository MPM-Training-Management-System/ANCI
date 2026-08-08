namespace server.DTOs.Trainer;

public class TrainerListDTO
{
    public Guid Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string? ProfileImage { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string MobileNumber { get; set; } = string.Empty;

    public string Expertise { get; set; } = string.Empty;

    public string Organization { get; set; } = string.Empty;

    public bool IsVerified { get; set; }

    public bool IsActive { get; set; }
}