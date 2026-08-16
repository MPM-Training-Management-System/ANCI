using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Participant;
using server.Models;
using server.Services.Interfaces;

namespace server.Services;

public class ParticipantService : IParticipantService
{
    private readonly AppDbContext _context;
    private readonly CloudinaryService _cloudinary;
    private readonly IParticipantPolicyService _policyService;
    public ParticipantService(
        AppDbContext context,
        CloudinaryService cloudinary,
        IParticipantPolicyService policyService)
    {
        _context = context;
        _cloudinary = cloudinary;
        _policyService = policyService;
    }

    // =====================================================
    // COMPLETE PARTICIPANT REGISTRATION
    // =====================================================

    public async Task<ParticipantModel> RegisterAsync(
        RegisterParticipantDTO dto)
    {
        using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            // ==========================================
            // VALIDATE EMAIL
            // ==========================================

            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                throw new Exception("Email is required.");
            }

            var email = dto.Email
                .Trim()
                .ToLower();

            // ==========================================
            // FIND EXISTING USER
            // ==========================================

            var user = await _context.Users
                .FirstOrDefaultAsync(x =>
                    x.Email.ToLower() == email);

            if (user == null)
            {
                throw new Exception(
                    "Account not found. Please register your account first."
                );
            }

            // ==========================================
            // CHECK EMAIL VERIFICATION
            // ==========================================

            if (!user.IsEmailVerified)
            {
                throw new Exception(
                    "Email address has not been verified."
                );
            }
            user.IsActive = false;
            // ==========================================
            // CHECK EXISTING PARTICIPANT
            // ==========================================

            var existingParticipant =
                await _context.Participants
                    .FirstOrDefaultAsync(x =>
                        x.UserId == user.Id);

            if (existingParticipant != null)
            {
                throw new Exception(
                    "Participant profile already exists."
                );
            }

            // ==========================================
// REQUIRED INFORMATION VALIDATION
// ==========================================

if (string.IsNullOrWhiteSpace(dto.FirstName))
{
    throw new Exception("First name is required.");
}

if (string.IsNullOrWhiteSpace(dto.LastName))
{
    throw new Exception("Last name is required.");
}

if (dto.DateOfBirth == default)
{
    throw new Exception("Date of birth is required.");
}

if (string.IsNullOrWhiteSpace(dto.Gender))
{
    throw new Exception("Gender is required.");
}

if (string.IsNullOrWhiteSpace(dto.CivilStatus))
{
    throw new Exception("Civil status is required.");
}

if (string.IsNullOrWhiteSpace(dto.MobileNumber))
{
    throw new Exception("Mobile number is required.");
}

if (string.IsNullOrWhiteSpace(dto.HomeAddress))
{
    throw new Exception("Home address is required.");
}

// ==========================================
// REQUIRED DOCUMENTS
// ==========================================

if (dto.ProfileImage == null ||
    dto.ProfileImage.Length == 0)
{
    throw new Exception(
        "Profile image is required."
    );
}

if (dto.ValidId == null ||
    dto.ValidId.Length == 0)
{
    throw new Exception(
        "Valid ID is required."
    );
}

            // ==========================================
            // UPLOAD PROFILE IMAGE
            // ==========================================

            var profileImage = string.Empty;
var validId = string.Empty;

if (dto.ProfileImage != null)
{
    profileImage =
        await _cloudinary.UploadImageAsync(
            dto.ProfileImage
        );
}

if (dto.ValidId != null)
{
    validId =
        await _cloudinary.UploadImageAsync(
            dto.ValidId
        );
}
            // ==========================================
            // UPDATE USER PERSONAL INFORMATION
            // ==========================================

            user.FirstName =
                dto.FirstName.Trim();

            user.MiddleName =
                dto.MiddleName?.Trim();

            user.LastName =
                dto.LastName.Trim();

            // ==========================================
            // CREATE PARTICIPANT
            // ==========================================

            var participant = new ParticipantModel
            {
                Id = Guid.NewGuid(),

                UserId = user.Id,

                User = user,

                ProfileImage = profileImage,
                ValidId = validId,
                FirstName =
                    dto.FirstName.Trim(),

                MiddleName =
                    dto.MiddleName?.Trim(),

                LastName =
                    dto.LastName.Trim(),

                DateOfBirth =
                    dto.DateOfBirth,

                Gender =
                    dto.Gender.Trim(),

                CivilStatus =
                    dto.CivilStatus.Trim(),

                MobileNumber =
                    dto.MobileNumber.Trim(),

                HomeAddress =
                    dto.HomeAddress.Trim(),

                EmergencyContactName =
                    dto.EmergencyContactName?.Trim(),

                EmergencyRelationship =
                    dto.EmergencyRelationship?.Trim(),

                EmergencyContactNumber =
                    dto.EmergencyContactNumber?.Trim(),

                IsActive = false,

                CreatedAt = DateTime.UtcNow
            };

           _context.Participants.Add(participant);

await _context.SaveChangesAsync();


// ==========================================
// AUTOMATIC POLICY CHECK
// ==========================================

var policyResult =
    await _policyService.CheckAsync(user.Id);


// ==========================================
// CREATE APPLICATION
// ==========================================

var application = new UserApplicationModel
{
    Id = Guid.NewGuid(),

    UserId = user.Id,

    Status = ApplicationStatus.Pending,

    PolicyStatus = policyResult.Passed
        ? PolicyStatus.Passed
        : PolicyStatus.Failed,

    PolicyRemarks = policyResult.Remarks,

    SubmittedAt = DateTime.UtcNow
};

_context.UserApplications.Add(application);

await _context.SaveChangesAsync();

await transaction.CommitAsync();

return participant;
}
catch
{
    await transaction.RollbackAsync();
    throw;
}
    }

    // =====================================================
    // GET ALL
    // =====================================================

    public async Task<IEnumerable<ParticipantListDTO>>
        GetAllAsync()
    {
        return await _context.Participants
            .Include(x => x.User)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new ParticipantListDTO
            {
                Id = x.Id,

                UserId = x.User.UserId,

                ProfileImage = x.ProfileImage,

                ValidId = x.ValidId,

                FullName = x.User.Fullname,

                Email = x.User.Email,

                MobileNumber = x.MobileNumber,

                IsActive = x.IsActive
            })
            .ToListAsync();
    }

    // =====================================================
    // GET BY ID
    // =====================================================

    public async Task<ParticipantResponseDTO?>
        GetByIdAsync(Guid id)
    {
        return await _context.Participants
            .Include(x => x.User)
            .Where(x => x.Id == id)
            .Select(x => new ParticipantResponseDTO
            {
                Id = x.Id,

                UserId = x.User.UserId,

                Username = x.User.Username,

                Email = x.User.Email,

                FullName = x.User.Fullname,

                ProfileImage = x.ProfileImage,
                
               

                FirstName = x.FirstName,

                MiddleName = x.MiddleName,

                LastName = x.LastName,

                DateOfBirth = x.DateOfBirth,

                Gender = x.Gender,

                CivilStatus = x.CivilStatus,

                MobileNumber = x.MobileNumber,

                HomeAddress = x.HomeAddress,

                EmergencyContactName =
                    x.EmergencyContactName,

                EmergencyRelationship =
                    x.EmergencyRelationship,

                EmergencyContactNumber =
                    x.EmergencyContactNumber,

                IsActive = x.IsActive
            })
            .FirstOrDefaultAsync();
    }

    // =====================================================
    // UPDATE
    // =====================================================

    public async Task UpdateAsync(
        Guid id,
        UpdateParticipantDTO dto)
    {
        var participant =
            await _context.Participants
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.Id == id);

        if (participant == null)
        {
            throw new Exception(
                "Participant not found."
            );
        }

        // Upload new image
        if (dto.ProfileImage != null)
        {
            participant.ProfileImage =
                await _cloudinary
                    .UploadImageAsync(dto.ProfileImage);
        }

        // Update User
        participant.User.FirstName =
            dto.FirstName.Trim();

        participant.User.MiddleName =
            dto.MiddleName?.Trim();

        participant.User.LastName =
            dto.LastName.Trim();

        // Update Participant
        participant.FirstName =
            dto.FirstName.Trim();

        participant.MiddleName =
            dto.MiddleName?.Trim();

        participant.LastName =
            dto.LastName.Trim();

        participant.DateOfBirth =
            dto.DateOfBirth;

        participant.Gender =
            dto.Gender.Trim();

        participant.CivilStatus =
            dto.CivilStatus.Trim();

        participant.MobileNumber =
            dto.MobileNumber.Trim();

        participant.HomeAddress =
            dto.HomeAddress.Trim();

        participant.EmergencyContactName =
            dto.EmergencyContactName?.Trim();

        participant.EmergencyRelationship =
            dto.EmergencyRelationship?.Trim();

        participant.EmergencyContactNumber =
            dto.EmergencyContactNumber?.Trim();

        await _context.SaveChangesAsync();
    }

    // =====================================================
    // DELETE
    // =====================================================

    public async Task DeleteAsync(Guid id)
    {
        var participant =
            await _context.Participants
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.Id == id);

        if (participant == null)
        {
            throw new Exception(
                "Participant not found."
            );
        }

        participant.IsActive = false;
        participant.User.IsActive = false;

        await _context.SaveChangesAsync();
    }

    // =====================================================
    // CHANGE STATUS
    // =====================================================

    public async Task ChangeStatusAsync(
        Guid id,
        bool isActive)
    {
        var participant =
            await _context.Participants
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.Id == id);

        if (participant == null)
        {
            throw new Exception(
                "Participant not found."
            );
        }

        participant.IsActive = isActive;
        participant.User.IsActive = isActive;

        await _context.SaveChangesAsync();
    }
}