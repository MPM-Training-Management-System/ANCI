using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;

using server.Data;
using server.DTOs.Email;
using server.DTOs.Otp;
using server.Enums;
using server.Models.Otp;
using server.Services.Email;
using server.Services.Interfaces;

namespace server.Services;

public class OtpService : IOtpService
{
    private readonly ApplicationDbContext _db;
    private readonly IEmailService _emailService;

    public OtpService(
        ApplicationDbContext db,
        IEmailService emailService)
    {
        _db = db;
        _emailService = emailService;
    }


    // =========================================================
    // EMAIL VERIFICATION
    // =========================================================

    public async Task<OtpResponse>
        SendVerificationOtpAsync(
            SendOtpRequest request)
    {
        return await SendOtpAsync(
            request,
            OtpPurpose.EmailVerification,
            "ANCI Email Verification Code",
            "Verify Your Email"
        );
    }


    public async Task<OtpResponse>
        VerifyOtpAsync(
            VerifyOtpRequest request)
    {
        var result = await VerifyOtpInternalAsync(
            request,
            OtpPurpose.EmailVerification
        );

        if (!result.Success)
        {
            return result;
        }

        // Email verification only
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

        user.IsEmailVerified = true;
        user.Status = UserStatus.Active;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return new OtpResponse
        {
            Success = true,
            Message =
                "Email verified successfully. Your account is now active."
        };
    }


    // =========================================================
    // PASSWORD RESET
    // =========================================================

    public async Task<OtpResponse>
        SendPasswordResetOtpAsync(
            SendOtpRequest request)
    {
        return await SendOtpAsync(
            request,
            OtpPurpose.PasswordReset,
            "ANCI Password Reset Code",
            "Reset Your Password"
        );
    }


    public async Task<OtpResponse>
        VerifyPasswordResetOtpAsync(
            VerifyOtpRequest request)
    {
        return await VerifyOtpInternalAsync(
            request,
            OtpPurpose.PasswordReset
        );
    }


    // =========================================================
    // LOGIN 2FA
    // =========================================================

    public async Task<OtpResponse>
        SendLoginOtpAsync(
            SendOtpRequest request)
    {
        return await SendOtpAsync(
            request,
            OtpPurpose.LoginTwoFactor,
            "ANCI Login Verification Code",
            "Verify Your Login"
        );
    }


    public async Task<OtpResponse>
        VerifyLoginOtpAsync(
            VerifyOtpRequest request)
    {
        return await VerifyOtpInternalAsync(
            request,
            OtpPurpose.LoginTwoFactor
        );
    }


    // =========================================================
    // GENERATE + SEND OTP
    // =========================================================

    private async Task<OtpResponse>
        SendOtpAsync(
            SendOtpRequest request,
            OtpPurpose purpose,
            string subject,
            string title)
    {
        var email = request.Email
            .Trim()
            .ToLowerInvariant();

        var user = await _db.Users
            .FirstOrDefaultAsync(
                x => x.Email == email
            );

        // Do not reveal whether an email exists.
        if (user is null)
        {
            return new OtpResponse
            {
                Success = true,
                Message =
                    "If the email is registered, an OTP has been sent."
            };
        }


        // Email verification should not be sent
        // to an already verified account.
        if (
            purpose == OtpPurpose.EmailVerification
            &&
            user.IsEmailVerified
        )
        {
            return new OtpResponse
            {
                Success = false,
                Message =
                    "Email address is already verified."
            };
        }


        // Invalidate previous unused OTPs
        var previousOtps =
            await _db.OtpVerifications
                .Where(x =>
                    x.UserId == user.Id &&
                    x.Purpose == purpose &&
                    !x.IsUsed
                )
                .ToListAsync();

        foreach (var oldOtp in previousOtps)
        {
            oldOtp.IsUsed = true;
        }


        // Generate 6-digit OTP
        var otpCode =
            RandomNumberGenerator
                .GetInt32(
                    100000,
                    1000000
                )
                .ToString();


        var now = DateTime.UtcNow;

        var otp = new OtpVerification
        {
            Id = Guid.NewGuid(),

            UserId = user.Id,

            OtpCode = otpCode,

            Purpose = purpose,

            ExpiresAt =
                now.AddMinutes(5),

            IsUsed = false,

            VerifiedAt = null,

            AttemptCount = 0,

            CreatedAt = now
        };


        _db.OtpVerifications.Add(otp);

        await _db.SaveChangesAsync();


        // =====================================================
        // EMAIL
        // =====================================================

        var emailBody = BuildOtpEmail(
            user.FullName,
            otpCode,
            title
        );


        try
        {
            await _emailService.SendAsync(
                new SendEmailDto
                {
                    ToEmail = user.Email,

                    Subject = subject,

                    Body = emailBody,

                    IsHtml = true
                }
            );
        }
        catch (Exception ex)
        {
            // Do not expose SMTP details.
            Console.WriteLine(
                $"Failed to send OTP email: {ex.Message}"
            );
        }


        // DEVELOPMENT ONLY
        Console.WriteLine(
            $"OTP [{purpose}] for {user.Email}: {otpCode}"
        );


        return new OtpResponse
        {
            Success = true,
            Message =
                "OTP sent successfully to your email."
        };
    }


    // =========================================================
    // VERIFY OTP INTERNAL
    // =========================================================

    private async Task<OtpResponse>
        VerifyOtpInternalAsync(
            VerifyOtpRequest request,
            OtpPurpose purpose)
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
                x.Purpose == purpose &&
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


        // Expired
        if (
            otp.ExpiresAt <=
            DateTime.UtcNow
        )
        {
            return new OtpResponse
            {
                Success = false,
                Message =
                    "OTP has expired."
            };
        }


        // Too many attempts
        if (otp.AttemptCount >= 5)
        {
            return new OtpResponse
            {
                Success = false,
                Message =
                    "Too many OTP attempts."
            };
        }


        // Wrong OTP
        if (
            otp.OtpCode !=
            request.OtpCode.Trim()
        )
        {
            otp.AttemptCount++;

            await _db.SaveChangesAsync();

            return new OtpResponse
            {
                Success = false,
                Message =
                    "Invalid OTP."
            };
        }


        // =====================================================
        // SUCCESS
        // =====================================================

        otp.IsUsed = true;

        otp.VerifiedAt =
            DateTime.UtcNow;

        await _db.SaveChangesAsync();


        return new OtpResponse
        {
            Success = true,
            Message =
                "OTP verified successfully."
        };
    }


    // =========================================================
    // OTP EMAIL TEMPLATE
    // =========================================================

    private static string BuildOtpEmail(
        string fullName,
        string otpCode,
        string title)
    {
        var safeName =
            System.Net.WebUtility
                .HtmlEncode(fullName);

        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset=""UTF-8"" />
    <meta
        name=""viewport""
        content=""width=device-width, initial-scale=1.0""
    />

    <title>{title}</title>
</head>

<body style=""
    margin:0;
    padding:0;
    background-color:#f4f7fb;
    font-family:Arial,Helvetica,sans-serif;
"">

    <table
        width=""100%""
        cellpadding=""0""
        cellspacing=""0""
        border=""0""
        style=""
            background-color:#f4f7fb;
            padding:40px 20px;
        ""
    >

        <tr>
            <td align=""center"">

                <table
                    width=""100%""
                    cellpadding=""0""
                    cellspacing=""0""
                    border=""0""
                    style=""
                        max-width:600px;
                        background-color:#ffffff;
                        border-radius:12px;
                        overflow:hidden;
                    ""
                >

                    <tr>
                        <td
                            style=""
                                padding:30px;
                                text-align:center;
                            ""
                        >

                            <h1
                                style=""
                                    margin:0;
                                    font-size:28px;
                                    color:#111827;
                                ""
                            >
                                ANCI
                            </h1>

                            <p
                                style=""
                                    margin:8px 0 0;
                                    font-size:14px;
                                    color:#6b7280;
                                ""
                            >
                                ACE NextGen Consultancy Inc.
                            </p>

                        </td>
                    </tr>


                    <tr>
                        <td
                            style=""
                                padding:10px 40px 40px;
                            ""
                        >

                            <h2
                                style=""
                                    margin:0 0 16px;
                                    font-size:24px;
                                    color:#111827;
                                ""
                            >
                                {title}
                            </h2>

                            <p
                                style=""
                                    margin:0 0 16px;
                                    font-size:15px;
                                    line-height:1.6;
                                    color:#4b5563;
                                ""
                            >
                                Hello
                                <strong>{safeName}</strong>,
                            </p>

                            <p
                                style=""
                                    margin:0 0 24px;
                                    font-size:15px;
                                    line-height:1.6;
                                    color:#4b5563;
                                ""
                            >
                                Please use the verification code
                                below to continue.
                            </p>


                            <table
                                width=""100%""
                                cellpadding=""0""
                                cellspacing=""0""
                                border=""0""
                            >

                                <tr>
                                    <td align=""center"">

                                        <div
                                            style=""
                                                display:inline-block;
                                                padding:18px 35px;
                                                background-color:#f3f4f6;
                                                border-radius:10px;
                                                letter-spacing:8px;
                                                font-size:32px;
                                                font-weight:bold;
                                                color:#111827;
                                            ""
                                        >
                                            {otpCode}
                                        </div>

                                    </td>
                                </tr>

                            </table>


                            <p
                                style=""
                                    margin:24px 0 0;
                                    text-align:center;
                                    font-size:14px;
                                    color:#6b7280;
                                ""
                            >
                                This code will expire in
                                <strong>5 minutes</strong>.
                            </p>


                            <p
                                style=""
                                    margin:24px 0 0;
                                    font-size:14px;
                                    line-height:1.6;
                                    color:#6b7280;
                                ""
                            >
                                If you did not request this code,
                                you can safely ignore this email.
                            </p>

                        </td>
                    </tr>


                    <tr>
                        <td
                            style=""
                                padding:20px 40px;
                                background-color:#f9fafb;
                                text-align:center;
                            ""
                        >

                            <p
                                style=""
                                    margin:0;
                                    font-size:12px;
                                    color:#9ca3af;
                                ""
                            >
                                © {DateTime.UtcNow.Year}
                                ACE NextGen Consultancy Inc.
                            </p>

                            <p
                                style=""
                                    margin:6px 0 0;
                                    font-size:12px;
                                    color:#9ca3af;
                                ""
                            >
                                This is an automated email.
                                Please do not reply.
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>

    </table>

</body>
</html>
";
    }
}