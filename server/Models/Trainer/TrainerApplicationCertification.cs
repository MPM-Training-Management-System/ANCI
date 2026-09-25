namespace server.Models.Trainer;

public class TrainerApplicationCertification
{
    public Guid Id { get; set; }

    public Guid TrainerApplicationId { get; set; }

    public string Name { get; set; }
        = string.Empty;

    public string? IssuingOrganization { get; set; }

    public DateOnly? IssuedDate { get; set; }

    public DateOnly? ExpirationDate { get; set; }

    public string? CertificateUrl { get; set; }


    // =========================================================
    // RELATIONSHIP
    // =========================================================

    public TrainerApplication TrainerApplication { get; set; }
        = default!;
}