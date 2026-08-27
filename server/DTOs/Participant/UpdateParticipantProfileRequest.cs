using System.ComponentModel.DataAnnotations;

namespace server.DTOs.Participant;

public class UpdateParticipantProfileRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string FirstName { get; set; } = string.Empty;

    [StringLength(100)]
    public string? MiddleName { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string LastName { get; set; } = string.Empty;

    public DateOnly? BirthDate { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [StringLength(50)]
    public string? Gender { get; set; }

    [Phone]
    [StringLength(30)]
    public string? MobileNumber { get; set; }
}