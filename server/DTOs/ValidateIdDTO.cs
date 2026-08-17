using Microsoft.AspNetCore.Http;

namespace server.DTOs
{
    public class ValidateIdDTO
    {
        public IFormFile File { get; set; } = null!;

        public string IdType { get; set; } = string.Empty;
    }
}