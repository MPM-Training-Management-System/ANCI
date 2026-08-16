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

    // =====================================================
    // GET ALL TRAINERS
    // =====================================================

    public async Task<IEnumerable<TrainerResponseDTO>>
        GetAllAsync()
    {
        var trainers =
            await _context.Trainers
                .Include(x => x.User)
                    .ThenInclude(
                        x => x.Application
                    )
                .OrderByDescending(
                    x => x.CreatedAt
                )
                .ToListAsync();

        return trainers.Select(
            MapToResponse
        );
    }

    // =====================================================
    // GET TRAINER BY ID
    // =====================================================

    public async Task<TrainerResponseDTO?>
        GetByIdAsync(Guid id)
    {
        var trainer =
            await _context.Trainers
                .Include(x => x.User)
                    .ThenInclude(
                        x => x.Application
                    )
                .FirstOrDefaultAsync(
                    x => x.Id == id
                );

        if (trainer == null)
        {
            return null;
        }

        return MapToResponse(
            trainer
        );
    }

    // =====================================================
    // COMPLETE PROFILE
    // =====================================================

    public async Task<TrainerResponseDTO>
        CompleteProfileAsync(
            Guid userId,
            CompleteTrainerProfileDTO dto)
    {
        using var transaction =
            await _context.Database
                .BeginTransactionAsync();

        try
        {
            // =================================================
            // USER
            // =================================================

            var user =
                await _context.Users
                    .Include(x => x.Trainer)
                    .Include(x => x.Application)
                    .FirstOrDefaultAsync(
                        x => x.Id == userId
                    );

            if (user == null)
            {
                throw new Exception(
                    "User account not found."
                );
            }

            // =================================================
            // EMAIL VERIFICATION
            // =================================================

            if (!user.IsEmailVerified)
            {
                throw new Exception(
                    "Please verify your email first."
                );
            }

            // =================================================
            // ROLE
            // =================================================

            if (!string.Equals(
                    user.Role,
                    "Trainer",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception(
                    "Only trainer accounts can complete a trainer profile."
                );
            }

            // =================================================
            // REQUIRED TEXT FIELDS
            // =================================================

            if (string.IsNullOrWhiteSpace(
                    dto.FirstName))
            {
                throw new Exception(
                    "First name is required."
                );
            }

            if (string.IsNullOrWhiteSpace(
                    dto.LastName))
            {
                throw new Exception(
                    "Last name is required."
                );
            }

            if (string.IsNullOrWhiteSpace(
                    dto.Gender))
            {
                throw new Exception(
                    "Gender is required."
                );
            }

            if (string.IsNullOrWhiteSpace(
                    dto.CivilStatus))
            {
                throw new Exception(
                    "Civil status is required."
                );
            }

            if (string.IsNullOrWhiteSpace(
                    dto.MobileNumber))
            {
                throw new Exception(
                    "Mobile number is required."
                );
            }

            if (string.IsNullOrWhiteSpace(
                    dto.HomeAddress))
            {
                throw new Exception(
                    "Home address is required."
                );
            }

            if (string.IsNullOrWhiteSpace(
                    dto.Expertise))
            {
                throw new Exception(
                    "Expertise is required."
                );
            }

            // =================================================
            // REQUIRED FILES
            // =================================================

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

            // =================================================
            // UPDATE USER NAME
            //
            // UserModel still keeps the account-level name.
            // =================================================

            user.FirstName =
                dto.FirstName.Trim();

            user.MiddleName =
                string.IsNullOrWhiteSpace(
                    dto.MiddleName)
                    ? null
                    : dto.MiddleName.Trim();

            user.LastName =
                dto.LastName.Trim();

            // =================================================
            // ACCOUNT MUST REMAIN INACTIVE
            //
            // Admin must approve first.
            // =================================================

            user.IsActive = false;

            // =================================================
            // UPLOAD PROFILE IMAGE
            // =================================================

            string profileImageUrl;

            try
            {
                profileImageUrl =
                    await _cloudinary
                        .UploadTrainerProfileAsync(
                            dto.ProfileImage
                        );
            }
            catch (Exception ex)
            {
                throw new Exception(
                    $"Failed to upload profile image: {ex.Message}",
                    ex
                );
            }

            // =================================================
            // UPLOAD VALID ID
            // =================================================

            string validIdUrl;

            try
            {
                validIdUrl =
                    await _cloudinary
                        .UploadTrainerValidIdAsync(
                            dto.ValidId
                        );
            }
            catch (Exception ex)
            {
                throw new Exception(
                    $"Failed to upload valid ID: {ex.Message}",
                    ex
                );
            }

            // =================================================
            // FIND EXISTING TRAINER
            // =================================================

            var trainer =
                await _context.Trainers
                    .FirstOrDefaultAsync(
                        x => x.UserId == user.Id
                    );

            // =================================================
            // CREATE TRAINER
            // =================================================

            if (trainer == null)
            {
                trainer = new TrainerModel
                {
                    Id =
                        Guid.NewGuid(),

                    UserId =
                        user.Id,

                    User =
                        user,

                    // =========================================
                    // PERSONAL INFORMATION
                    // =========================================

                    FirstName =
                        dto.FirstName.Trim(),

                    MiddleName =
                        string.IsNullOrWhiteSpace(
                            dto.MiddleName)
                            ? null
                            : dto.MiddleName.Trim(),

                    LastName =
                        dto.LastName.Trim(),

                    DateOfBirth =
                        dto.DateOfBirth,

                    Gender =
                        dto.Gender.Trim(),

                    CivilStatus =
                        dto.CivilStatus.Trim(),

                    // =========================================
                    // CONTACT INFORMATION
                    // =========================================

                    MobileNumber =
                        dto.MobileNumber.Trim(),

                    HomeAddress =
                        dto.HomeAddress.Trim(),

                    // =========================================
                    // PROFESSIONAL INFORMATION
                    // =========================================

                    Expertise =
                        dto.Expertise.Trim(),

                    YearsOfExperience =
                        dto.YearsOfExperience,

                    Organization =
                        dto.Organization?.Trim()
                        ?? string.Empty,

                    Biography =
                        dto.Biography?.Trim()
                        ?? string.Empty,

                    // =========================================
                    // VERIFICATION
                    // =========================================

                    ProfileImage =
                        profileImageUrl,

                    ValidId =
                        validIdUrl,

                    // =========================================
                    // REGISTRATION
                    // =========================================

                    IsProfileCompleted =
                        true,

                    // Trainer profile also remains inactive
                    // until admin approval.
                    IsActive =
                        false,

                    CreatedAt =
                        DateTime.UtcNow
                };

                _context.Trainers.Add(
                    trainer
                );
            }
            else
            {
                // =================================================
                // UPDATE EXISTING TRAINER
                // =================================================

                trainer.FirstName =
                    dto.FirstName.Trim();

                trainer.MiddleName =
                    string.IsNullOrWhiteSpace(
                        dto.MiddleName)
                        ? null
                        : dto.MiddleName.Trim();

                trainer.LastName =
                    dto.LastName.Trim();

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
                    dto.Organization?.Trim()
                    ?? string.Empty;

                trainer.Biography =
                    dto.Biography?.Trim()
                    ?? string.Empty;

                trainer.ProfileImage =
                    profileImageUrl;

                trainer.ValidId =
                    validIdUrl;

                trainer.IsProfileCompleted =
                    true;

                trainer.IsActive =
                    false;
            }

            // =================================================
            // APPLICATION
            //
            // ONE APPLICATION PER USER
            //
            // Shared by:
            // Participant
            // Trainer
            // =================================================

            var application =
                await _context.UserApplications
                    .FirstOrDefaultAsync(
                        x => x.UserId == user.Id
                    );

            if (application == null)
            {
                application =
                    new UserApplicationModel
                    {
                        Id =
                            Guid.NewGuid(),

                        UserId =
                            user.Id,

                        Status =
                            ApplicationStatus.Pending,

                        PolicyStatus =
                            PolicyStatus.Pending,

                        PolicyRemarks =
                            null,

                        RejectionReason =
                            null,

                        ReviewedBy =
                            null,

                        ReviewedAt =
                            null,

                        SubmittedAt =
                            DateTime.UtcNow
                    };

                _context.UserApplications.Add(
                    application
                );
            }
            else
            {
                // =============================================
                // RESET EXISTING APPLICATION
                // =============================================

                application.Status =
                    ApplicationStatus.Pending;

                application.PolicyStatus =
                    PolicyStatus.Pending;

                application.PolicyRemarks =
                    null;

                application.RejectionReason =
                    null;

                application.ReviewedBy =
                    null;

                application.ReviewedAt =
                    null;

                application.SubmittedAt =
                    DateTime.UtcNow;
            }

            // =================================================
            // SAVE
            // =================================================

            await _context.SaveChangesAsync();

            // =================================================
            // COMMIT
            // =================================================

            await transaction.CommitAsync();

            // =================================================
            // RETURN
            // =================================================

            return MapToResponse(
                trainer
            );
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    // =====================================================
    // UPDATE TRAINER
    // =====================================================

    public async Task<TrainerResponseDTO?>
        UpdateAsync(
            Guid id,
            UpdateTrainerDTO dto)
    {
        var trainer =
            await _context.Trainers
                .Include(x => x.User)
                    .ThenInclude(
                        x => x.Application
                    )
                .FirstOrDefaultAsync(
                    x => x.Id == id
                );

        if (trainer == null)
        {
            return null;
        }

        if (trainer.User == null)
        {
            throw new Exception(
                "Trainer user account not found."
            );
        }

        // =================================================
        // USER NAME
        // =================================================

        trainer.User.FirstName =
            dto.FirstName.Trim();

        trainer.User.MiddleName =
            dto.MiddleName?.Trim();

        trainer.User.LastName =
            dto.LastName.Trim();

        // =================================================
        // TRAINER NAME
        // =================================================

        trainer.FirstName =
            dto.FirstName.Trim();

        trainer.MiddleName =
            dto.MiddleName?.Trim();

        trainer.LastName =
            dto.LastName.Trim();

        // =================================================
        // TRAINER INFORMATION
        // =================================================

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
            dto.Organization?.Trim()
            ?? string.Empty;

        trainer.Biography =
            dto.Biography?.Trim()
            ?? string.Empty;

        // =================================================
        // PROFILE IMAGE
        // =================================================

        if (dto.ProfileImage != null &&
            dto.ProfileImage.Length > 0)
        {
            trainer.ProfileImage =
                await _cloudinary
                    .UploadTrainerProfileAsync(
                        dto.ProfileImage
                    );
        }

        // =================================================
        // VALID ID
        // =================================================

        if (dto.ValidId != null &&
            dto.ValidId.Length > 0)
        {
            trainer.ValidId =
                await _cloudinary
                    .UploadTrainerValidIdAsync(
                        dto.ValidId
                    );
        }

        // =================================================
        // SAVE
        // =================================================

        await _context.SaveChangesAsync();

        return MapToResponse(
            trainer
        );
    }

    // =====================================================
    // UPDATE STATUS
    //
    // IMPORTANT:
    // User.IsActive is the account source of truth.
    // =====================================================

    public async Task<bool>
        UpdateStatusAsync(
            Guid id,
            bool isActive)
    {
        var trainer =
            await _context.Trainers
                .Include(x => x.User)
                .FirstOrDefaultAsync(
                    x => x.Id == id
                );

        if (trainer == null)
        {
            return false;
        }

        // Trainer profile status
        trainer.IsActive =
            isActive;

        // Actual account status
        if (trainer.User != null)
        {
            trainer.User.IsActive =
                isActive;
        }

        await _context.SaveChangesAsync();

        return true;
    }

    // =====================================================
    // VERIFY
    //
    // NOTE:
    // This is kept for compatibility with your existing
    // TrainerController.
    //
    // The new Dashboard should use:
    //
    // UserApplicationService.ApproveAsync()
    //
    // instead of this method.
    // =====================================================

    public async Task VerifyAsync(
        Guid id,
        bool isApproved)
    {
        var trainer =
            await _context.Trainers
                .Include(x => x.User)
                    .ThenInclude(
                        x => x.Application
                    )
                .FirstOrDefaultAsync(
                    x => x.Id == id
                );

        if (trainer == null)
        {
            throw new Exception(
                "Trainer not found."
            );
        }

        if (trainer.User == null)
        {
            throw new Exception(
                "Trainer user account not found."
            );
        }

        var application =
            trainer.User.Application;

        if (application == null)
        {
            throw new Exception(
                "Trainer application not found."
            );
        }

        if (isApproved)
        {
            application.Status =
                ApplicationStatus.Approved;

            trainer.IsActive =
                true;

            trainer.User.IsActive =
                true;

            application.RejectionReason =
                null;

            application.PolicyRemarks =
                null;

            application.ReviewedAt =
                DateTime.UtcNow;
        }
        else
        {
            application.Status =
                ApplicationStatus.Rejected;

            trainer.IsActive =
                false;

            trainer.User.IsActive =
                false;

            application.ReviewedAt =
                DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    // =====================================================
    // DELETE / DEACTIVATE
    // =====================================================

    public async Task<bool>
        DeleteAsync(
            Guid id)
    {
        var trainer =
            await _context.Trainers
                .Include(x => x.User)
                .FirstOrDefaultAsync(
                    x => x.Id == id
                );

        if (trainer == null)
        {
            return false;
        }

        trainer.IsActive =
            false;

        if (trainer.User != null)
        {
            trainer.User.IsActive =
                false;
        }

        await _context.SaveChangesAsync();

        return true;
    }

    // =====================================================
    // RESPONSE MAPPER
    // =====================================================

    private static TrainerResponseDTO
        MapToResponse(
            TrainerModel trainer)
    {
        if (trainer.User == null)
        {
            throw new Exception(
                "Trainer User relationship was not loaded."
            );
        }

        var application =
            trainer.User.Application;

        return new TrainerResponseDTO
        {
            // =============================================
            // IDs
            // =============================================

            Id =
                trainer.Id,

            UserId =
                trainer.UserId.ToString(),

            // =============================================
            // ACCOUNT
            // =============================================

            Username =
                trainer.User.Username,

            Email =
                trainer.User.Email,

            // =============================================
            // PERSONAL INFORMATION
            //
            // IMPORTANT:
            // Get these from TrainerModel.
            // =============================================

            FirstName =
                trainer.FirstName,

            MiddleName =
                trainer.MiddleName,

            LastName =
                trainer.LastName,

            // =============================================
            // TRAINER INFORMATION
            // =============================================

            DateOfBirth =
                trainer.DateOfBirth,

            Gender =
                trainer.Gender,

            CivilStatus =
                trainer.CivilStatus,

            MobileNumber =
                trainer.MobileNumber,

            HomeAddress =
                trainer.HomeAddress,

            Expertise =
                trainer.Expertise,

            YearsOfExperience =
                trainer.YearsOfExperience,

            Organization =
                trainer.Organization,

            Biography =
                trainer.Biography,

            // =============================================
            // FILES
            // =============================================

            ProfileImage =
                trainer.ProfileImage,

            ValidId =
                trainer.ValidId,

            // =============================================
            // PROFILE
            // =============================================

            IsProfileCompleted =
                trainer.IsProfileCompleted,

            // =============================================
            // ACCOUNT STATUS
            //
            // UserModel is the source of truth.
            // =============================================

            IsActive =
                trainer.User.IsActive,

            IsEmailVerified =
                trainer.User.IsEmailVerified,

            // =============================================
            // APPLICATION
            // =============================================

            ApplicationStatus =
                application?.Status
                ?? ApplicationStatus.Pending,

            PolicyStatus =
                application?.PolicyStatus
                ?? PolicyStatus.Pending,

            PolicyRemarks =
                application?.PolicyRemarks,

            SubmittedAt =
                application?.SubmittedAt
                ?? default,

            // =============================================
            // CREATED
            // =============================================

            CreatedAt =
                trainer.CreatedAt
        };
    }
}