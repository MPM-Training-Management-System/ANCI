namespace server.DTOs.Auth;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public UserLoginDto User { get; set; } = new();
}

public class UserLoginDto
{
    public Guid Id { get; set; }

    public string UserCode { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;
}