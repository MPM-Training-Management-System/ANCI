using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using server.Models.Auth;

namespace server.Security;

public class JwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(
        IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public (string Token, DateTime ExpiresAt)
        GenerateToken(User user)
    {
        var key =
            _configuration["Jwt:Key"];

        if (string.IsNullOrWhiteSpace(key))
        {
            throw new InvalidOperationException(
                "JWT key is not configured."
            );
        }

        var issuer =
            _configuration["Jwt:Issuer"];

        var audience =
            _configuration["Jwt:Audience"];

        var expirationMinutes =
            int.TryParse(
                _configuration[
                    "Jwt:ExpirationMinutes"
                ],
                out var minutes)
                ? minutes
                : 60;

        var expiresAt =
            DateTime.UtcNow.AddMinutes(
                expirationMinutes
            );

        var claims = new List<Claim>
        {
            // Required User ID claim
            new Claim(
                JwtRegisteredClaimNames.Sub,
                user.Id.ToString()
            ),

            // ASP.NET Core user ID
            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id.ToString()
            ),

            // Role claim
            new Claim(
                ClaimTypes.Role,
                user.Role.ToString()
            ),

            // Email
            new Claim(
                ClaimTypes.Email,
                user.Email
            ),

            // Name
            new Claim(
                ClaimTypes.Name,
                user.FullName
            ),

            // Internal user code
            new Claim(
                "userCode",
                user.UserCode
            )
        };

        var securityKey =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(key)
            );

        var credentials =
            new SigningCredentials(
                securityKey,
                SecurityAlgorithms.HmacSha256
            );

        var token =
            new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: expiresAt,
                signingCredentials: credentials
            );

        var tokenString =
            new JwtSecurityTokenHandler()
                .WriteToken(token);

        return (
            tokenString,
            expiresAt
        );
    }
}