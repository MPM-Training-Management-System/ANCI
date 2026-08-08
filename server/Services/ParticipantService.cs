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

    public ParticipantService(
        AppDbContext context,
        CloudinaryService cloudinary)
    {
        _context = context;
        _cloudinary = cloudinary;
    }

    // =====================================================
    // REGISTER
    // =====================================================

    public async Task RegisterAsync(RegisterParticipantDTO dto)
    {
        using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            dto.Email = dto.Email.Trim();
            dto.Username = dto.Username.Trim();

            // Check Email
            if (await _context.Users.AnyAsync(x =>
                x.Email.ToLower() == dto.Email.ToLower()))
            {
                throw new Exception("Email already exists.");
            }

            // Check Username
            if (await _context.Users.AnyAsync(x =>
                x.Username.ToLower() == dto.Username.ToLower()))
            {
                throw new Exception("Username already exists.");
            }

            // Upload Profile Image
            string? image = null;

            if (dto.ProfileImage != null)
            {
                image = await _cloudinary
                    .UploadImageAsync(dto.ProfileImage);
            }

            // Create User
            var user = new UserModel
            {
                Id = Guid.NewGuid(),

                UserId = await GenerateUserId("Participant"),

                Username = dto.Username,

                Email = dto.Email,

                Password = BCrypt.Net.BCrypt
                    .HashPassword(dto.Password),

                Role = "Participant",
IsActive = true,

                CreatedAt = DateTime.UtcNow,
               FirstName = dto.FirstName.Trim(),

MiddleName = dto.MiddleName?.Trim(),

LastName = dto.LastName.Trim(),
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            // Create Participant
            var participant = new ParticipantModel
            {
                Id = Guid.NewGuid(),

                UserId = user.Id,

                ProfileImage = image,

                DateOfBirth = dto.DateOfBirth,

                Gender = dto.Gender,

                CivilStatus = dto.CivilStatus,

                MobileNumber = dto.MobileNumber,

                HomeAddress = dto.HomeAddress,

                EmergencyContactName =
                    dto.EmergencyContactName,

                EmergencyRelationship =
                    dto.EmergencyRelationship,

                EmergencyContactNumber =
                    dto.EmergencyContactNumber
            };

            _context.Participants.Add(participant);

            await _context.SaveChangesAsync();

            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    // =====================================================
    // TODO
    // =====================================================

    public async Task<List<ParticipantListDTO>> GetAllAsync()
{
    return await _context.Participants
        .Include(x => x.User)
        .OrderByDescending(x => x.CreatedAt)
        .Select(x => new ParticipantListDTO
        {
            Id = x.Id,

            UserId = x.User.UserId,

            ProfileImage = x.ProfileImage,

            FullName = x.User.Fullname,

            Email = x.User.Email,

            MobileNumber = x.MobileNumber,

            IsActive = x.IsActive
        })
        .ToListAsync();
}

    public async Task<ParticipantResponseDTO?> GetByIdAsync(Guid id)
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

            EmergencyContactName = x.EmergencyContactName,

            EmergencyRelationship = x.EmergencyRelationship,

            EmergencyContactNumber = x.EmergencyContactNumber,

            IsActive = x.IsActive
        })
        .FirstOrDefaultAsync();
}
   public async Task UpdateAsync(Guid id, UpdateParticipantDTO dto)
{
    var participant = await _context.Participants
        .Include(x => x.User)
        .FirstOrDefaultAsync(x => x.Id == id);

    if (participant == null)
    {
        throw new Exception("Participant not found.");
    }

    // Upload new image
    if (dto.ProfileImage != null)
    {
        participant.ProfileImage =
            await _cloudinary.UploadImageAsync(dto.ProfileImage);
    }

    // Update User
    participant.User.FirstName =
    dto.FirstName.Trim();

participant.User.MiddleName =
    dto.MiddleName?.Trim();

participant.User.LastName =
    dto.LastName.Trim();



    // Update Participant
    participant.FirstName = dto.FirstName;
    participant.MiddleName = dto.MiddleName;
    participant.LastName = dto.LastName;

    participant.DateOfBirth = dto.DateOfBirth;

    participant.Gender = dto.Gender;

    participant.CivilStatus = dto.CivilStatus;

    participant.MobileNumber = dto.MobileNumber;

    participant.HomeAddress = dto.HomeAddress;

    participant.EmergencyContactName =
        dto.EmergencyContactName;

    participant.EmergencyRelationship =
        dto.EmergencyRelationship;

    participant.EmergencyContactNumber =
        dto.EmergencyContactNumber;

    await _context.SaveChangesAsync();
}

   public async Task DeleteAsync(Guid id)
{
    var participant = await _context.Participants
        .Include(x => x.User)
        .FirstOrDefaultAsync(x => x.Id == id);

    if (participant == null)
    {
        throw new Exception("Participant not found.");
    }

    // Soft Delete
    participant.IsActive = false;

    participant.User.IsActive = false;

    await _context.SaveChangesAsync();
}

    public async Task ChangeStatusAsync(Guid id, bool isActive)
{
    var participant = await _context.Participants
        .Include(x => x.User)
        .FirstOrDefaultAsync(x => x.Id == id);

    if (participant == null)
    {
        throw new Exception("Participant not found.");
    }

    participant.IsActive = isActive;

    participant.User.IsActive = isActive;

    await _context.SaveChangesAsync();
}

    // =====================================================
    // HELPERS
    // =====================================================

    private static string BuildFullName(
        string first,
        string? middle,
        string last)
    {
        return string.Join(" ",
            new[]
            {
                first.Trim(),
                middle?.Trim(),
                last.Trim()
            }
            .Where(x => !string.IsNullOrWhiteSpace(x)));
    }

    private async Task<string> GenerateUserId(string role)
    {
        var year = DateTime.Now.ToString("yy");

        var prefix = role switch
        {
            "Admin" => "A",
            "Trainer" => "T",
            "Participant" => "P",
            _ => "U"
        };

        var lastUser = await _context.Users
            .Where(x => x.UserId.StartsWith($"{prefix}{year}-"))
            .OrderByDescending(x => x.UserId)
            .FirstOrDefaultAsync();

        int next = 1;

        if (lastUser != null)
        {
            var split = lastUser.UserId.Split('-');

            if (split.Length == 2 &&
                int.TryParse(split[1], out int number))
            {
                next = number + 1;
            }
        }

        return $"{prefix}{year}-{next:D3}";
    }
}