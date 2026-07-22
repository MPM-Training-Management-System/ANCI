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
        public async Task<IEnumerable<UserResponseDTO>> GetAllAsync(
            string? search,
            string? role)
        {
            var users = await _context.Users.ToListAsync();

            users = UserSearchAlgorithm
                .Search(users, search, role)
                .ToList();

            return users.Select(user => new UserResponseDTO
            {
                Id = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Create_at = user.Create_at
            });
        }

        // ===========================================
        // GET USER BY ID
        // ===========================================
        public async Task<UserResponseDTO?> GetByIdAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
                return null;

            return new UserResponseDTO
            {
                Id = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Create_at = user.Create_at
            };
        }

        // ===========================================
        // CREATE USER
        // ===========================================
        public async Task<UserResponseDTO> CreateAsync(CreateUserDTO dto)
        {
            if (await _context.Users.AnyAsync(x => x.Email == dto.Email))
                throw new Exception("Email already exists.");

            if (await _context.Users.AnyAsync(x => x.Username == dto.Username))
                throw new Exception("Username already exists.");

            var user = new UserModel
            {
                Username = dto.Username,
                FullName = dto.FullName,
                Email = dto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role,
                Create_at = DateTime.UtcNow
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            return new UserResponseDTO
            {
                Id = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Create_at = user.Create_at
            };
        }

        // ===========================================
        // UPDATE USER
        // ===========================================
        public async Task<UserResponseDTO?> UpdateAsync(
            int id,
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

            if (await _context.Users.AnyAsync(x =>
                x.Username == dto.Username &&
                x.Id != id))
            {
                throw new Exception("Username already exists.");
            }

            user.Username = dto.Username;
            user.FullName = dto.FullName;
            user.Email = dto.Email;
            user.Role = dto.Role;

            await _context.SaveChangesAsync();

            return new UserResponseDTO
            {
                Id = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Create_at = user.Create_at
            };
        }

        // ===========================================
        // DELETE USER
        // ===========================================
        public async Task<bool> DeleteAsync(int id)
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