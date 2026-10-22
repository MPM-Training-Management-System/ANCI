namespace server.DTOs.Admin.Recovery;

public sealed class RecoveryUserListItemDto
{
    public Guid Id { get; set; }
    public string UserCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool HasParticipantProfile { get; set; }
    public bool HasTrainerProfile { get; set; }
}

public sealed class RecoveryProfileDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string? LastName { get; set; }
    public string? ProfileImageUrl { get; set; }
}

public sealed class RecoveryUserDetailsDto
{
    public Guid Id { get; set; }
    public string UserCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? MobileNumber { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsEmailVerified { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public bool AlreadyExistsInProduction { get; set; }

    public bool EmailConflict { get; set; }

public bool UserCodeConflict { get; set; }

public bool GoogleAccountConflict { get; set; }

public bool ParticipantProfileConflict { get; set; }

public bool TrainerProfileConflict { get; set; }

public List<string> Conflicts { get; set; } = [];

public bool CanRestore => Conflicts.Count == 0;

    public RecoveryProfileDto? ParticipantProfile { get; set; }
    public RecoveryProfileDto? TrainerProfile { get; set; }
}

public sealed class RecoveryRestoreResultDto
{
    public Guid UserId { get; set; }
    public string UserCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public bool ParticipantProfileRestored { get; set; }
    public bool TrainerProfileRestored { get; set; }
    public string Message { get; set; } = string.Empty;
}