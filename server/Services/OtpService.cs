using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using server.Services.Interfaces;

namespace server.Services
{
    public class OtpService : IOtpService
    {
        private readonly AppDbContext _context;

        public OtpService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<string> GenerateOtpAsync(
            Guid userId,
            string purpose = "EmailVerification")
        {
            // Generate 6-digit OTP
            string otp = RandomNumberGenerator
                .GetInt32(100000, 1000000)
                .ToString();

            // Hash OTP before storing
            string otpHash = HashOtp(otp);

            // Invalidate previous unused OTPs
            var previousOtps = await _context.OtpCodes
                .Where(x =>
                    x.UserId == userId &&
                    x.Purpose == purpose &&
                    !x.IsUsed)
                .ToListAsync();

            foreach (var previousOtp in previousOtps)
            {
                previousOtp.IsUsed = true;
                previousOtp.UsedAt = DateTime.UtcNow;
            }

            // Create new OTP
            var otpCode = new OtpCodeModel
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CodeHash = otpHash,
                Purpose = purpose,
                ExpiresAt = DateTime.UtcNow.AddMinutes(5),
                IsUsed = false,
                Attempts = 0,
                CreatedAt = DateTime.UtcNow
            };

            _context.OtpCodes.Add(otpCode);

            await _context.SaveChangesAsync();

            // Return the actual OTP.
            // This will later be sent through EmailService.
            return otp;
        }

        public async Task<bool> VerifyOtpAsync(
            Guid userId,
            string otp,
            string purpose = "EmailVerification")
        {
            var otpCode = await _context.OtpCodes
                .Where(x =>
                    x.UserId == userId &&
                    x.Purpose == purpose &&
                    !x.IsUsed)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync();

            if (otpCode == null)
            {
                return false;
            }

            // Expired
            if (otpCode.ExpiresAt < DateTime.UtcNow)
            {
                return false;
            }

            // Maximum attempts
            if (otpCode.Attempts >= 5)
            {
                return false;
            }

            otpCode.Attempts++;

            string inputHash = HashOtp(otp);

            if (inputHash != otpCode.CodeHash)
            {
                await _context.SaveChangesAsync();
                return false;
            }

            // Correct OTP
            otpCode.IsUsed = true;
            otpCode.UsedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        private static string HashOtp(string otp)
        {
            using var sha256 = SHA256.Create();

            byte[] bytes = Encoding.UTF8.GetBytes(otp);

            byte[] hash = sha256.ComputeHash(bytes);

            return Convert.ToHexString(hash);
        }
    }
}