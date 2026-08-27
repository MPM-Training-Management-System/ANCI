using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace server.DTOs.Trainer;

public class UpdateTrainerApplicationImageRequest
{
    [Required]
    public IFormFile ProfileImage { get; set; } = null!;
}