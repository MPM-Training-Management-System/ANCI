using Microsoft.EntityFrameworkCore;
using server.Data;
using server.DTOs.User;
using server.Models;
using server.Services.Interfaces;

namespace server.Services
{
    public class UserApplicationService
        : IUserApplicationService
    {
        private readonly AppDbContext _context;

        public UserApplicationService(
            AppDbContext context)
        {
            _context = context;
        }

        // =====================================================
        // GET PENDING APPLICATIONS
        //
        // BOTH:
        // Participant
        // Trainer
        //
        // ONE SHARED APPLICATION SOURCE
        // =====================================================

        public async Task<
            IEnumerable<UserApplicationResponseDTO>
        > GetPendingApplicationsAsync()
        {
            var applications =
                await _context.UserApplications
                    .Include(a => a.User)
                        .ThenInclude(u => u.Participant)

                    .Include(a => a.User)
                        .ThenInclude(u => u.Trainer)

                    .Where(a =>
                        a.Status ==
                        ApplicationStatus.Pending
                    )
                    .OrderByDescending(
                        a => a.SubmittedAt
                    )
                    .ToListAsync();

            return applications.Select(
                MapToResponseDTO
            );
        }

        // =====================================================
        // GET APPLICATION DETAILS
        // =====================================================

        public async Task<
            UserApplicationDetailsDTO?
        > GetByIdAsync(Guid id)
        {
            var application =
                await _context.UserApplications
                    .Include(a => a.User)
                        .ThenInclude(u => u.Participant)

                    .Include(a => a.User)
                        .ThenInclude(u => u.Trainer)

                    .FirstOrDefaultAsync(
                        a => a.Id == id
                    );

            if (application == null)
            {
                return null;
            }

            return MapToDetailsDTO(
                application
            );
        }

        // =====================================================
        // APPROVE
        // =====================================================

        public async Task ApproveAsync(
    Guid applicationId,
    Guid adminId)
{
    var application =
        await _context.UserApplications
            .Include(a => a.User)
            .FirstOrDefaultAsync(
                a => a.Id == applicationId
            );

    if (application == null)
    {
        throw new Exception(
            "Application not found."
        );
    }

    if (
        application.Status !=
        ApplicationStatus.Pending
    )
    {
        throw new Exception(
            "This application has already been reviewed."
        );
    }

    // ==========================================
    // ADMIN FINAL DECISION
    // ==========================================

    application.Status =
        ApplicationStatus.Approved;

    application.ReviewedBy =
        adminId;

    application.ReviewedAt =
        DateTime.UtcNow;

    application.RejectionReason =
        null;

    // ==========================================
    // ONE USER STATUS
    // ==========================================

    application.User.IsActive =
        true;

    await _context.SaveChangesAsync();
}

        // =====================================================
        // REJECT
        // =====================================================

        public async Task RejectAsync(
            Guid applicationId,
            Guid adminId,
            string reason)
        {
            var application =
                await _context.UserApplications
                    .Include(a => a.User)
                    .FirstOrDefaultAsync(
                        a =>
                            a.Id ==
                            applicationId
                    );

            if (application == null)
            {
                throw new Exception(
                    "Application not found."
                );
            }

            // ==============================================
            // ONLY PENDING CAN BE REJECTED
            // ==============================================

            if (
                application.Status !=
                ApplicationStatus.Pending
            )
            {
                throw new Exception(
                    "This application has already been reviewed."
                );
            }

            // ==============================================
            // REASON REQUIRED
            // ==============================================

            if (
                string.IsNullOrWhiteSpace(
                    reason
                )
            )
            {
                throw new Exception(
                    "Rejection reason is required."
                );
            }

            // ==============================================
            // REJECT
            // ==============================================

            application.Status =
                ApplicationStatus.Rejected;

            application.ReviewedBy =
                adminId;

            application.ReviewedAt =
                DateTime.UtcNow;

            application.RejectionReason =
                reason.Trim();

            // ==============================================
            // USER IS THE SINGLE SOURCE OF TRUTH
            // ==============================================

            application.User.IsActive =
                false;

            await _context.SaveChangesAsync();
        }

        // =====================================================
        // RESPONSE MAPPER
        // =====================================================

        private static UserApplicationResponseDTO
            MapToResponseDTO(
                UserApplicationModel application)
        {
            var user =
                application.User;

            var role =
                user.Role?.Trim()
                ?? string.Empty;

            string firstName =
                string.Empty;

            string? middleName =
                null;

            string lastName =
                string.Empty;

            string fullName =
                string.Empty;

            string? profileImage =
                null;

            // =================================================
            // PARTICIPANT
            // =================================================

            if (
                role.Equals(
                    "Participant",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                var participant =
                    user.Participant;

                if (participant != null)
                {
                    firstName =
                        participant.FirstName;

                    middleName =
                        participant.MiddleName;

                    lastName =
                        participant.LastName;

                    fullName =
                        BuildFullName(
                            participant.FirstName,
                            participant.MiddleName,
                            participant.LastName
                        );

                    profileImage =
                        participant.ProfileImage;
                }
            }

            // =================================================
            // TRAINER
            // =================================================

            else if (
                role.Equals(
                    "Trainer",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                var trainer =
                    user.Trainer;

                if (trainer != null)
                {
                    // =========================================
                    // IMPORTANT
                    //
                    // GET NAME FROM TRAINER MODEL
                    // NOT user.Fullname
                    // =========================================

                    firstName =
                        trainer.FirstName;

                    // =========================================
                    // FALLBACK FOR OLD TRAINER RECORDS
                    //
                    // If Trainer.MiddleName is still NULL,
                    // use User.MiddleName.
                    // =========================================

                    middleName =
                        user.MiddleName;

                    lastName =
                        trainer.LastName;

                    fullName =
                        BuildFullName(
                            trainer.FirstName,
                            trainer.MiddleName
                                ?? user.MiddleName,
                            trainer.LastName
                        );

                    profileImage =
                        trainer.ProfileImage;
                }
            }

            return new UserApplicationResponseDTO
            {
                Id =
                    application.Id,

                UserId =
                    application.UserId,

                UserIdNumber =
                    user.UserId,

                Username =
                    user.Username,

                Email =
                    user.Email,

                Role =
                    role,

                FirstName =
                    firstName,

                MiddleName =
                    middleName,

                LastName =
                    lastName,

                FullName =
                    fullName,

                ProfileImage =
                    profileImage,

                Status =
                    application.Status.ToString(),

                PolicyStatus =
                    application.PolicyStatus.ToString(),

                PolicyRemarks =
                    application.PolicyRemarks,

                SubmittedAt =
                    application.SubmittedAt,

                IsActive =
                    user.IsActive,

                IsEmailVerified =
                    user.IsEmailVerified
            };
        }

        // =====================================================
        // DETAILS MAPPER
        // =====================================================

        private static UserApplicationDetailsDTO
            MapToDetailsDTO(
                UserApplicationModel application)
        {
            var user =
                application.User;

            var role =
                user.Role?.Trim()
                ?? string.Empty;

            var dto =
                new UserApplicationDetailsDTO
                {
                    Id =
                        application.Id,

                    UserId =
                        application.UserId,

                    UserIdNumber =
                        user.UserId,

                    Username =
                        user.Username,

                    Email =
                        user.Email,

                    Role =
                        role,

                    IsActive =
                        user.IsActive,

                    IsEmailVerified =
                        user.IsEmailVerified,

                    Status =
                        application.Status.ToString(),

                    PolicyStatus =
                        application.PolicyStatus.ToString(),

                    PolicyRemarks =
                        application.PolicyRemarks,

                    ReviewedBy =
                        application.ReviewedBy,

                    ReviewedAt =
                        application.ReviewedAt,

                    RejectionReason =
                        application.RejectionReason,

                    SubmittedAt =
                        application.SubmittedAt
                };

            // =================================================
            // PARTICIPANT DETAILS
            // =================================================

            if (
                role.Equals(
                    "Participant",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                var participant =
                    user.Participant;

                if (participant != null)
                {
                    dto.FirstName =
                        participant.FirstName;

                    dto.MiddleName =
                        participant.MiddleName;

                    dto.LastName =
                        participant.LastName;

                    dto.FullName =
                        BuildFullName(
                            participant.FirstName,
                            participant.MiddleName,
                            participant.LastName
                        );

                    dto.DateOfBirth =
                        participant.DateOfBirth;

                    dto.Gender =
                        participant.Gender;

                    dto.CivilStatus =
                        participant.CivilStatus;

                    dto.MobileNumber =
                        participant.MobileNumber;

                    dto.HomeAddress =
                        participant.HomeAddress;

                    dto.EmergencyContactName =
                        participant.EmergencyContactName;

                    dto.EmergencyRelationship =
                        participant.EmergencyRelationship;

                    dto.EmergencyContactNumber =
                        participant.EmergencyContactNumber;

                    dto.ProfileImage =
                        participant.ProfileImage;

                    dto.ValidId =
                        participant.ValidId;
                }
            }

            // =================================================
            // TRAINER DETAILS
            // =================================================

            else if (
                role.Equals(
                    "Trainer",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                var trainer =
                    user.Trainer;

                if (trainer != null)
                {
                    // =========================================
                    // GET NAME DIRECTLY FROM TRAINER
                    // =========================================

                    dto.FirstName =
                        trainer.FirstName;

                    dto.MiddleName =
                        trainer.MiddleName
                        ?? user.MiddleName;

                    dto.LastName =
                        trainer.LastName;

                    dto.FullName =
                        BuildFullName(
                            trainer.FirstName,
                            trainer.MiddleName
                                ?? user.MiddleName,
                            trainer.LastName
                        );

                    // =========================================
                    // PERSONAL
                    // =========================================

                    dto.DateOfBirth =
                        trainer.DateOfBirth;

                    dto.Gender =
                        trainer.Gender;

                    dto.CivilStatus =
                        trainer.CivilStatus;

                    // =========================================
                    // CONTACT
                    // =========================================

                    dto.MobileNumber =
                        trainer.MobileNumber;

                    dto.HomeAddress =
                        trainer.HomeAddress;

                    // =========================================
                    // PROFESSIONAL
                    // =========================================

                    dto.Expertise =
                        trainer.Expertise;

                    dto.YearsOfExperience =
                        trainer.YearsOfExperience;

                    dto.Organization =
                        trainer.Organization;

                    dto.Biography =
                        trainer.Biography;

                    // =========================================
                    // FILES
                    // =========================================

                    dto.ProfileImage =
                        trainer.ProfileImage;

                    dto.ValidId =
                        trainer.ValidId;
                }
            }

            return dto;
        }

        // =====================================================
        // BUILD FULL NAME
        // =====================================================

        private static string BuildFullName(
            string? firstName,
            string? middleName,
            string? lastName)
        {
            return string.Join(
                " ",
                new[]
                {
                    firstName,
                    middleName,
                    lastName
                }
                .Where(
                    x =>
                        !string.IsNullOrWhiteSpace(
                            x
                        )
                )
                .Select(
                    x => x!.Trim()
                )
            );
        }
    }
}