namespace server.DTOs.Participant;

public record ParticipantProfileDto(
    Guid Id,
    Guid UserId,
    string UserCode,
    string FullName,
    string Email,
    string? MobileNumber,
    string? FirstName,
    string? MiddleName,
    string? LastName,
    DateOnly? BirthDate,
    string? Address,
    string? Gender,
    string? ProfileImageUrl,
    string Role,
    string Status
);