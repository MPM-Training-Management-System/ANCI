using server.DTOs.Participant;

namespace server.Services.Interfaces;

public interface IParticipantProfileService
{
    Task<ParticipantProfileDto?> GetMyProfileAsync(
        Guid userId
    );
    Task<ParticipantProfileDto?> UpdateMyProfileAsync(
        Guid userId,
        UpdateParticipantProfileRequest request
    );

    Task<ParticipantProfileDto?> UpdateProfileImageAsync(
        Guid userId,
        IFormFile profileImage
    );
}