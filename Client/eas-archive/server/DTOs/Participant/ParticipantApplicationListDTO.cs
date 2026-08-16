using server.Models;

namespace server.DTOs.Participant;

public class ParticipantApplicationListDTO
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string? MiddleName { get; set; }

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? Username { get; set; }

    public string? ProfileImage { get; set; }

    public ApplicationStatus Status { get; set; }

    public PolicyStatus PolicyStatus { get; set; }

    public string? PolicyRemarks { get; set; }

    public Guid? ReviewedBy { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public string? RejectionReason { get; set; }

    public DateTime SubmittedAt { get; set; }
}