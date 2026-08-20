using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.Otp;
using server.Enums;
using server.Models.Otp;
using server.Services.Interfaces;

namespace server.Services;

public class OtpService : IOtpService
{
    private readonly ApplicationDbContext _db;

    public OtpService(
        ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<OtpResponse>
        SendVerificationOtpAsync(
            SendOtpRequest request)
    {
        var email = request.Email
            .Trim()
            .ToLowerInvariant();

        var user = await _db.Users
            .FirstOrDefaultAsync(
                x => x.Email == email
            );

        if (user is null)
        {
            return new OtpResponse
            {
                Success = false,
                Message =
                    "Unable to process OTP request."
            };
        }

        if (user.IsEmailVerified)
        {
            return new OtpResponse
            {
                Success = false,
                Message =
                    "Email address is already verified."
            };
        }

        var otpCode =
            RandomNumberGenerator
                .GetInt32(
                    100000,
                    1000000
                )
                .ToString();

        var otp = new OtpVerification
        {
            Id = Guid.NewGuid(),

            UserId = user.Id,

            OtpCode = otpCode,

            Purpose =
                OtpPurpose.EmailVerification,

            ExpiresAt =
                DateTime.UtcNow.AddMinutes(5),

            IsUsed = false,

            VerifiedAt = null,

            AttemptCount = 0,

            CreatedAt =
                DateTime.UtcNow
        };

        _db.OtpVerifications.Add(otp);

        await _db.SaveChangesAsync();

        // DEVELOPMENT ONLY
        Console.WriteLine(
            $"OTP for {user.Email}: {otpCode}"
        );

        return new OtpResponse
        {
            Success = true,
            Message =
                "OTP generated successfully."
        };
    }

    public async Task<OtpResponse>
        VerifyOtpAsync(
            VerifyOtpRequest request)
    {
        var email = request.Email
            .Trim()
            .ToLowerInvariant();

        var user = await _db.Users
            .FirstOrDefaultAsync(
                x => x.Email == email
            );

        if (user is null)
        {
            return new OtpResponse
            {
                Success = false,
                Message = "Invalid OTP."
            };
        }

        var otp = await _db.OtpVerifications
            .Where(x =>
                x.UserId == user.Id &&
                x.Purpose ==
                    OtpPurpose.EmailVerification &&
                !x.IsUsed
            )
            .OrderByDescending(
                x => x.CreatedAt
            )
            .FirstOrDefaultAsync();

        if (otp is null)
        {
            return new OtpResponse
            {
                Success = false,
                Message =
                    "Invalid or expired OTP."
            };
        }

        if (otp.ExpiresAt <= DateTime.UtcNow)
        {
            return new OtpResponse
            {
                Success = false,
                Message =
                    "OTP has expired."
            };
        }

        if (otp.AttemptCount >= 5)
        {
            return new OtpResponse
            {
                Success = false,
                Message =
                    "Too many OTP attempts."
            };
        }

        if (otp.OtpCode !=
            request.OtpCode.Trim())
        {
            otp.AttemptCount++;

            await _db.SaveChangesAsync();

            return new OtpResponse
            {
                Success = false,
                Message = "Invalid OTP."
            };
        }

        otp.IsUsed = true;

        otp.VerifiedAt =
            DateTime.UtcNow;

        user.IsEmailVerified = true;

        user.Status =
            UserStatus.Active;

        user.UpdatedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return new OtpResponse
        {
            Success = true,
            Message =
                "Email verified successfully. Your account is now active."
        };
    }
}