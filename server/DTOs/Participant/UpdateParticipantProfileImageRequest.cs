using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace server.DTOs.Participant;

public class UpdateParticipantProfileImageRequest
{
    [Required]
    public IFormFile ProfileImage { get; set; } = null!;
}