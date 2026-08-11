using Microsoft.EntityFrameworkCore;
using server.Data;
using server.Models;
using server.Services.Interfaces;
using server.DTOs.Participant;
namespace server.Services
{
    public class ParticipantApplicationService
        : IParticipantApplicationService
    {
        private readonly AppDbContext _context;

        private readonly ICacheService _cacheService;

        public ParticipantApplicationService(
            AppDbContext context,
            ICacheService cacheService)
        {
            _context = context;
            _cacheService = cacheService;
        }

        // ==========================================
        // GET PENDING APPLICATIONS
        // ==========================================

        public async Task<IEnumerable<ParticipantApplicationListDTO>>
    GetPendingApplicationsAsync()
{
    return await _context.ParticipantApplications
        .Where(a =>
            a.Status == ApplicationStatus.Pending)
        .Include(a => a.User)
        .OrderByDescending(a => a.SubmittedAt)
        .Select(a => new ParticipantApplicationListDTO
        {
            Id = a.Id,

            UserId = a.UserId,

            FirstName =
                a.User.FirstName,

            MiddleName =
                a.User.MiddleName,

            LastName =
                a.User.LastName,

            Email =
                a.User.Email,

            Username =
                a.User.Username,

            ProfileImage =
                a.User.Participant != null
                    ? a.User.Participant.ProfileImage
                    : null,

            Status =
                a.Status,

            PolicyStatus =
                a.PolicyStatus,

            PolicyRemarks =
                a.PolicyRemarks,

            ReviewedBy =
                a.ReviewedBy,

            ReviewedAt =
                a.ReviewedAt,

            RejectionReason =
                a.RejectionReason,

            SubmittedAt =
                a.SubmittedAt
        })
        .ToListAsync();
}


        // ==========================================
        // APPROVE
        // ==========================================

        public async Task ApproveAsync(
            Guid applicationId,
            Guid adminId)
        {
            var application =
                await _context.ParticipantApplications
                    .Include(a => a.User)
                    .ThenInclude(u => u.Participant)
                    .FirstOrDefaultAsync(
                        a => a.Id == applicationId
                    );

            if (application == null)
            {
                throw new Exception(
                    "Participant application not found."
                );
            }

            if (application.Status !=
                ApplicationStatus.Pending)
            {
                throw new Exception(
                    "This application has already been reviewed."
                );
            }

            // ==========================================
            // APPROVE APPLICATION
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
// ACTIVATE USER
// ==========================================

application.User.IsActive = true;

// ==========================================
// ACTIVATE PARTICIPANT
// ==========================================

if (application.User.Participant != null)
{
    application.User.Participant.IsActive = true;
}

// ==========================================
// SAVE CHANGES FIRST
// ==========================================

await _context.SaveChangesAsync();

// ==========================================
// CLEAR LOGIN CACHE
// ==========================================

_cacheService.Remove(
    $"user:login:{application.User.Email.Trim().ToLower()}"
);

_cacheService.Remove(
    $"user:login:{application.User.Username.Trim().ToLower()}"
);

// ==========================================
// SAVE CHANGES
// ==========================================

await _context.SaveChangesAsync();
        }


        // ==========================================
        // REJECT
        // ==========================================
public async Task<ParticipantApplicationDetailsDTO?>
    GetByIdAsync(Guid id)
{
    var application =
        await _context.ParticipantApplications
            .Include(a => a.User)
            .ThenInclude(u => u.Participant)
            .FirstOrDefaultAsync(
                a => a.Id == id
            );

    if (application == null)
    {
        return null;
    }

    var user = application.User;
    var participant = user.Participant;

    if (participant == null)
    {
        throw new Exception(
            "Participant profile not found."
        );
    }

    return new ParticipantApplicationDetailsDTO
    {
        // ==========================================
        // APPLICATION
        // ==========================================

        Id = application.Id,

        UserId = application.UserId,

        Status = application.Status,

        PolicyStatus = application.PolicyStatus,

        PolicyRemarks =
            application.PolicyRemarks,

        ReviewedBy =
            application.ReviewedBy,

        ReviewedAt =
            application.ReviewedAt,

        RejectionReason =
            application.RejectionReason,

        SubmittedAt =
            application.SubmittedAt,


        // ==========================================
        // ACCOUNT
        // ==========================================

        UserIdNumber =
            user.UserId,

        Username =
            user.Username,

        Email =
            user.Email,

        Role =
            user.Role,

        IsActive =
            user.IsActive,

        IsEmailVerified =
            user.IsEmailVerified,


        // ==========================================
        // PERSONAL
        // ==========================================

        FirstName =
            participant.FirstName,

        MiddleName =
            participant.MiddleName,

        LastName =
            participant.LastName,

        DateOfBirth =
            participant.DateOfBirth,

        Gender =
            participant.Gender,

        CivilStatus =
            participant.CivilStatus,

        MobileNumber =
            participant.MobileNumber,

        HomeAddress =
            participant.HomeAddress,


        // ==========================================
        // EMERGENCY
        // ==========================================

        EmergencyContactName =
            participant.EmergencyContactName,

        EmergencyRelationship =
            participant.EmergencyRelationship,

        EmergencyContactNumber =
            participant.EmergencyContactNumber,


        // ==========================================
        // DOCUMENTS
        // ==========================================

        ProfileImage =
            participant.ProfileImage,

        ValidId =
            participant.ValidId
    };
}
        public async Task RejectAsync(
            Guid applicationId,
            Guid adminId,
            string reason)
        {
            if (string.IsNullOrWhiteSpace(reason))
            {
                throw new Exception(
                    "Rejection reason is required."
                );
            }

            var application =
                await _context.ParticipantApplications
                    .Include(a => a.User)
                    .ThenInclude(u => u.Participant)
                    .FirstOrDefaultAsync(
                        a => a.Id == applicationId
                    );

            if (application == null)
            {
                throw new Exception(
                    "Participant application not found."
                );
            }

            if (application.Status !=
                ApplicationStatus.Pending)
            {
                throw new Exception(
                    "This application has already been reviewed."
                );
            }

            // ==========================================
            // REJECT APPLICATION
            // ==========================================

            application.Status =
                ApplicationStatus.Rejected;

            application.ReviewedBy =
                adminId;

            application.ReviewedAt =
                DateTime.UtcNow;

            application.RejectionReason =
                reason.Trim();

          // ==========================================
// KEEP USER INACTIVE
// ==========================================

application.User.IsActive = false;

// ==========================================
// KEEP PARTICIPANT INACTIVE
// ==========================================

if (application.User.Participant != null)
{
    application.User.Participant.IsActive = false;
}

// ==========================================
// SAVE CHANGES FIRST
// ==========================================

await _context.SaveChangesAsync();

// ==========================================
// CLEAR LOGIN CACHE
// ==========================================

_cacheService.Remove(
    $"user:login:{application.User.Email.Trim().ToLower()}"
);

_cacheService.Remove(
    $"user:login:{application.User.Username.Trim().ToLower()}"
);}
    }

    
}