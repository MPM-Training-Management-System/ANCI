namespace server.DTOs.Trainer;

public class UpdateTrainerApplicationRequest
{
    public string? Specialization { get; set; }

    public int? YearsOfExperience { get; set; }

    public string? CertificationName { get; set; }

    public string? CertificationNumber { get; set; }
}