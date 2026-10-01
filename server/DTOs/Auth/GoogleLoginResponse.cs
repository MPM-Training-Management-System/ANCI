namespace server.DTOs.Auth;

public class GoogleLoginResponse
{
    public bool IsNewUser { get; set; }

    public bool RequiresRegistration { get; set; }

    public string? GoogleSubjectId { get; set; }

    public string? Email { get; set; }

    public string? FirstName { get; set; }

    public string? LastName { get; set; }

    public string? FullName { get; set; }

    public string? ProfileImageUrl { get; set; }

    public LoginResponse? Login { get; set; }
}