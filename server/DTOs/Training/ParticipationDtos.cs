namespace server.DTOs.Training;

// ==========================================================
// PARTICIPATION SETTING
// ==========================================================

public class ParticipationSettingDto
{
    public Guid Id { get; set; }

    public Guid TrainingBatchId { get; set; }

    public int RequiredRecitations { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}


// ==========================================================
// PARTICIPATION RECORD
// ==========================================================

public class ParticipationRecordDto
{
    public Guid Id { get; set; }

    public Guid EnrollmentId { get; set; }

    public Guid TrainingSessionId { get; set; }

    public Guid RecordedByUserId { get; set; }

    public DateTime RecordedAt { get; set; }

    public string? Remarks { get; set; }
}


// ==========================================================
// PARTICIPANT PARTICIPATION
// ==========================================================

public class ParticipationParticipantDto
{
    public Guid EnrollmentId { get; set; }

    public Guid ParticipantProfileId { get; set; }

    public string ParticipantName { get; set; } = string.Empty;

    public bool HasRecited { get; set; }

    public int ActualRecitations { get; set; }

    public int RequiredRecitations { get; set; }

    public decimal ParticipationPercentage { get; set; }

    public Guid? ParticipationRecordId { get; set; }
}


// ==========================================================
// PARTICIPATION PROGRESS
// ==========================================================

public class ParticipationProgressDto
{
    public Guid EnrollmentId { get; set; }

    public int ActualRecitations { get; set; }

    public int RequiredRecitations { get; set; }

    public decimal ParticipationPercentage { get; set; }
}