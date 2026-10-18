
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace server.DTOs.Participant;

public class UpdateParticipantValidIdRequest
{
    [Required]
    public IFormFile ValidIdImage { get; set; } = default!;

    [Required]
    [StringLength(100)]
    public string ValidIdType { get; set; } = string.Empty;

    [StringLength(100)]
    public string? ValidIdNumber { get; set; }
}
