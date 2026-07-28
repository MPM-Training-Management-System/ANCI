using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using server.Algorithms;
using server.Data;
using server.DTOs.User;
using server.Models;
using server.Services.Interfaces;

namespace server.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        // ===========================================
        // GET ALL USERS
        // ===========================================
       public async Task<IEnumerable<UserResponseDTO>> GetAllAsync(string? search, string? role)
{
    var users = await _context.Users
        .Include(u => u.Participant)
        .ToListAsync();

    users = UserSearchAlgorithm
        .Search(users, search, role)
        .ToList();

   

    return users.Select(user => new UserResponseDTO
    {
        Id = user.Id,
        UserId = user.UserId,
        Username = user.Username,
        Fullname = user.Fullname,
        Email = user.Email,
        IsActive = user.IsActive,
        ProfileImage = user.Participant?.ProfileImage,
        Role = user.Role,
        CreatedAt = user.CreatedAt
    });
}

        // ===========================================
        // GET USER BY ID
        // ===========================================
        public async Task<UserResponseDTO?> GetByIdAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return null;

            return new UserResponseDTO
            {
                Id = user.Id,
                UserId = user.UserId,
                Email = user.Email,
                Fullname = user.Fullname,
                Username = user.Username,
                Role = user.Role,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,

    ProfileImage = user.Participant?.ProfileImage

            };
        }

        // ===========================================
        // CREATE USER
        // ===========================================
        public async Task<UserResponseDTO> CreateAsync(CreateUserDTO dto)
        {
            if (await _context.Users.AnyAsync(x => x.Email == dto.Email))
                throw new Exception("Email already exists.");

            var user = new UserModel
            {
                Email = dto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            return new UserResponseDTO
            {
                Id = user.Id,
                UserId= user.UserId,
                Email = user.Email,
                Fullname = user.Fullname,
                Username = user.Username,
                Role = user.Role,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,

    ProfileImage = user.Participant?.ProfileImage

            };
        }

        // ===========================================
        // UPDATE USER
        // ===========================================
        public async Task<UserResponseDTO?> UpdateAsync(
            Guid id,
            UpdateUserDTO dto)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return null;

            if (await _context.Users.AnyAsync(x =>
                x.Email == dto.Email &&
                x.Id != id))
            {
                throw new Exception("Email already exists.");
            }

            user.Email = dto.Email;
            user.Role = dto.Role;

            await _context.SaveChangesAsync();

            return new UserResponseDTO
            {
                Id = user.Id,
                UserId = user.UserId,
                Email = user.Email,
                Fullname = user.Fullname,
                Username = user.Username,
                Role = user.Role,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,

    ProfileImage = user.Participant?.ProfileImage

            };
        }

        // ===========================================
        // DELETE USER
        // ===========================================
        public async Task<bool> DeleteAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return false;

            _context.Users.Remove(user);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}