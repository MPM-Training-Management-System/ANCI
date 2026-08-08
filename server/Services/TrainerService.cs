using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Trainer;
using server.Models;
using server.Services.Interfaces;

namespace server.Services;

public class TrainerService : ITrainerService
{
    private readonly AppDbContext _context;
    private readonly CloudinaryService _cloudinary;

    public TrainerService(
        AppDbContext context,
        CloudinaryService cloudinary)
    {
        _context = context;
        _cloudinary = cloudinary;
    }

 public async Task RegisterAsync(RegisterTrainerDTO dto)
{
    using var transaction =
        await _context.Database.BeginTransactionAsync();

    try
    {
        dto.Email = dto.Email.Trim();
        dto.Username = dto.Username.Trim();

        if (await _context.Users.AnyAsync(x =>
            x.Email.ToLower() == dto.Email.ToLower()))
        {
            throw new Exception("Email already exists.");
        }

        if (await _context.Users.AnyAsync(x =>
            x.Username.ToLower() == dto.Username.ToLower()))
        {
            throw new Exception("Username already exists.");
        }

        var user = new UserModel
        {
            Id = Guid.NewGuid(),

            UserId = await GenerateUserId("Trainer"),

            FirstName = dto.FirstName.Trim(),

            LastName = dto.LastName.Trim(),

            Username = dto.Username,

            Email = dto.Email,

            Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),

            Role = "Trainer",

            IsActive = true,

            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        var trainer = new TrainerModel
        {
            Id = Guid.NewGuid(),

            UserId = user.Id,

            IsVerified = false,

            IsActive = true,

            IsProfileCompleted = false,

            CreatedAt = DateTime.UtcNow
        };

        _context.Trainers.Add(trainer);

        await _context.SaveChangesAsync();

        await transaction.CommitAsync();
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}
    public async Task<List<TrainerListDTO>> GetAllAsync()
{
    return await _context.Trainers
        .Include(x => x.User)
        .OrderByDescending(x => x.CreatedAt)
        .Select(x => new TrainerListDTO
        {
            Id = x.Id,

            UserId = x.User.UserId,

            ProfileImage = x.ProfileImage,

            FullName = x.User.Fullname,

            Email = x.User.Email,

            MobileNumber = x.MobileNumber,

            Expertise = x.Expertise,

            Organization = x.Organization,

            IsVerified = x.IsVerified,

            IsActive = x.IsActive
        })
        .ToListAsync();
}

   public async Task<TrainerResponseDTO?> GetByIdAsync(Guid id)
{
    return await _context.Trainers
        .Include(x => x.User)
        .Where(x => x.Id == id)
        .Select(x => new TrainerResponseDTO
        {
            Id = x.Id,

            UserId = x.User.UserId,

            FirstName = x.User.FirstName,

            MiddleName = x.User.MiddleName,

            LastName = x.User.LastName,

           

            Username = x.User.Username,

            Email = x.User.Email,

            ProfileImageUrl = x.ProfileImage,

            DateOfBirth = x.DateOfBirth,

            Gender = x.Gender,

            CivilStatus = x.CivilStatus,

            MobileNumber = x.MobileNumber,

            HomeAddress = x.HomeAddress,

            Expertise = x.Expertise,

            YearsOfExperience = x.YearsOfExperience,

            Organization = x.Organization,

            Biography = x.Biography,

            IsVerified = x.IsVerified,

            IsActive = x.IsActive,

            IsProfileCompleted = x.IsProfileCompleted,

            CreatedAt = x.CreatedAt
        })
        .FirstOrDefaultAsync();
}
public async Task CompleteProfileAsync(
    Guid trainerId,
    CompleteTrainerProfileDTO dto)
{
    var trainer = await _context.Trainers
        .Include(x => x.User)
        .FirstOrDefaultAsync(x => x.Id == trainerId);

    if (trainer == null)
    {
        throw new Exception("Trainer not found.");
    }

    string? image = trainer.ProfileImage;

    if (dto.ProfileImage != null)
    {
        image = await _cloudinary.UploadImageAsync(
            dto.ProfileImage);
    }

    trainer.User.MiddleName = dto.MiddleName?.Trim();

    trainer.ProfileImage = image;

    trainer.DateOfBirth = dto.DateOfBirth;

    trainer.Gender = dto.Gender.Trim();

    trainer.CivilStatus = dto.CivilStatus.Trim();

    trainer.MobileNumber = dto.MobileNumber.Trim();

    trainer.HomeAddress = dto.HomeAddress.Trim();

    trainer.Expertise = dto.Expertise.Trim();

    trainer.YearsOfExperience =
        dto.YearsOfExperience;

    trainer.Organization =
        dto.Organization.Trim();

    trainer.Biography =
        dto.Biography.Trim();

    trainer.IsProfileCompleted = true;

    await _context.SaveChangesAsync();
}
   public async Task UpdateAsync(
    Guid id,
    UpdateTrainerDTO dto)
{
    var trainer = await _context.Trainers
        .Include(x => x.User)
        .FirstOrDefaultAsync(x => x.Id == id);

    if (trainer == null)
    {
        throw new Exception("Trainer not found.");
    }

    if (dto.ProfileImage != null)
    {
        trainer.ProfileImage =
            await _cloudinary.UploadImageAsync(
                dto.ProfileImage);
    }

    trainer.User.FirstName =
        dto.FirstName.Trim();

    trainer.User.MiddleName =
        dto.MiddleName?.Trim();

    trainer.User.LastName =
        dto.LastName.Trim();

    trainer.User.Email =
        dto.Email.Trim();

    trainer.User.Username =
        dto.Username.Trim();

    trainer.DateOfBirth =
        dto.DateOfBirth;

    trainer.Gender =
        dto.Gender.Trim();

    trainer.CivilStatus =
        dto.CivilStatus.Trim();

    trainer.MobileNumber =
        dto.MobileNumber.Trim();

    trainer.HomeAddress =
        dto.HomeAddress.Trim();

    trainer.Expertise =
        dto.Expertise.Trim();

    trainer.YearsOfExperience =
        dto.YearsOfExperience;

    trainer.Organization =
        dto.Organization.Trim();

    trainer.Biography =
        dto.Biography.Trim();

    await _context.SaveChangesAsync();
}
   public async Task ChangeStatusAsync(Guid id, bool isActive)
{
    var trainer = await _context.Trainers
        .Include(x => x.User)
        .FirstOrDefaultAsync(x => x.Id == id);

    if (trainer == null)
    {
        throw new Exception("Trainer not found.");
    }

    trainer.IsActive = isActive;
    trainer.User.IsActive = isActive;

    await _context.SaveChangesAsync();
}

    public async Task VerifyAsync(Guid id, bool isVerified)
{
    var trainer = await _context.Trainers
        .FirstOrDefaultAsync(x => x.Id == id);

    if (trainer == null)
    {
        throw new Exception("Trainer not found.");
    }

    trainer.IsVerified = isVerified;

    await _context.SaveChangesAsync();
}


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
public async Task DeleteAsync(Guid id)
{
    var trainer = await _context.Trainers
        .Include(x => x.User)
        .FirstOrDefaultAsync(x => x.Id == id);

    if (trainer == null)
    {
        throw new Exception("Trainer not found.");
    }

    trainer.IsActive = false;
    trainer.User.IsActive = false;

    await _context.SaveChangesAsync();
}
}