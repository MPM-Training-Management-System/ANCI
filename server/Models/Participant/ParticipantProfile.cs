using server.Models.Auth;
namespace server.Models.Participant;

public class ParticipantProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? FirstName { get; set; }
    public string? MiddleName { get; set; }
    public string? LastName { get; set; }
    public DateOnly? BirthDate { get; set; }
    public string? Address { get; set; }
    public string? Gender { get; set; }
    public string? ProfileImageUrl { get; set; }

    public User User { get; set; } = default!;

    public ICollection<Enrollment> Enrollments { get; set; } = [];

}