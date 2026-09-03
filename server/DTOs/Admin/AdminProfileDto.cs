namespace server.DTOs.Admin;

public record AdminProfileDto(
    Guid Id,
    string UserCode,
    string FullName,
    string Email,
    string? MobileNumber,
    string Role,
    string Status
);