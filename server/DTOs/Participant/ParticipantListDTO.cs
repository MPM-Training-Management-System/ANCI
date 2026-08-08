

namespace server.DTOs.Participant
{


public class ParticipantListDTO
{
    public Guid Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string? ProfileImage { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string MobileNumber { get; set; } = string.Empty;

    public bool IsActive { get; set; }
}

}