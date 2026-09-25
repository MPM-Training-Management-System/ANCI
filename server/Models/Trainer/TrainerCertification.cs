namespace server.Models.Trainer;

public class TrainerCertification
{
    public Guid Id { get; set; }

    public Guid TrainerProfileId { get; set; }

    public string Name { get; set; }
        = string.Empty;

    public string? IssuingOrganization { get; set; }

    public DateOnly? IssuedDate { get; set; }

    public DateOnly? ExpirationDate { get; set; }

    public string? CertificateUrl { get; set; }

    public TrainerProfile TrainerProfile { get; set; }
        = default!;
}