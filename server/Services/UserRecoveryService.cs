using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

using server.Data;
using server.DTOs.Admin.Recovery;
using server.Interfaces;
using server.Models.Auth;
using server.Services.Interfaces;

namespace server.Services;

public sealed class UserRecoveryService : IUserRecoveryService
{
    private readonly ApplicationDbContext _productionDb;
    private readonly IConfiguration _configuration;
    private readonly ICacheService _cacheService;

    public UserRecoveryService(
        ApplicationDbContext productionDb,
        IConfiguration configuration,
        ICacheService cacheService
    )
    {
        _productionDb = productionDb;
        _configuration = configuration;
        _cacheService = cacheService;
    }

    // =========================================================
    // CREATE A SEPARATE CONTEXT FOR THE LOCAL RECOVERY DATABASE
    // =========================================================

    private ApplicationDbContext CreateRecoveryDbContext()
    {
        var connectionString =
            _configuration.GetConnectionString("RecoveryConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "RecoveryConnection is missing. Configure it in " +
                "appsettings.Development.json."
            );
        }

        var options =
            new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseNpgsql(connectionString)
                .Options;

        return new ApplicationDbContext(
            options,
            _cacheService
        );
    }

    // =========================================================
    // GET /api/admin/recovery/users?search=...
    // SEARCH LOCAL USERS NOT ALREADY PRESENT IN PRODUCTION
    // =========================================================

    public async Task<IReadOnlyList<RecoveryUserListItemDto>> SearchAsync(
        string? search,
        CancellationToken cancellationToken = default
    )
    {
        await using var recoveryDb = CreateRecoveryDbContext();

        var query = recoveryDb.Users
            .AsNoTracking()
            .Include(u => u.ParticipantProfile)
            .Include(u => u.TrainerProfile)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";

            query = query.Where(u =>
                EF.Functions.ILike(u.FullName, term) ||
                EF.Functions.ILike(u.Email, term) ||
                EF.Functions.ILike(u.UserCode, term)
            );
        }

        // Limit source results to avoid loading the entire backup.
        var sourceUsers = await query
            .OrderBy(u => u.FullName)
            .Take(100)
            .ToListAsync(cancellationToken);

        if (sourceUsers.Count == 0)
        {
            return Array.Empty<RecoveryUserListItemDto>();
        }

        var sourceIds = sourceUsers
            .Select(u => u.Id)
            .ToList();

        var productionIds = await _productionDb.Users
            .AsNoTracking()
            .Where(u => sourceIds.Contains(u.Id))
            .Select(u => u.Id)
            .ToListAsync(cancellationToken);

        var existingIds = productionIds.ToHashSet();

        return sourceUsers
            .Where(u => !existingIds.Contains(u.Id))
            .Select(u => new RecoveryUserListItemDto
            {
                Id = u.Id,
                UserCode = u.UserCode,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role.ToString(),
                Status = u.Status.ToString(),
                CreatedAt = u.CreatedAt,
                HasParticipantProfile = u.ParticipantProfile != null,
                HasTrainerProfile = u.TrainerProfile != null
            })
            .ToList();
    }

   public async Task<RecoveryUserDetailsDto?> GetByIdAsync(
    Guid id,
    CancellationToken cancellationToken = default
)
{
    await using var recoveryDb = CreateRecoveryDbContext();

    var user = await recoveryDb.Users
        .AsNoTracking()
        .Include(u => u.ParticipantProfile)
        .Include(u => u.TrainerProfile)
        .FirstOrDefaultAsync(
            u => u.Id == id,
            cancellationToken
        );

    if (user is null)
    {
        return null;
    }

    var conflicts = new List<string>();

    // Check primary key.
    var idConflict = await _productionDb.Users
        .AsNoTracking()
        .AnyAsync(
            u => u.Id == user.Id,
            cancellationToken
        );

    if (idConflict)
    {
        conflicts.Add("A user with this ID already exists.");
    }

    // Check email, case-insensitively.
    var normalizedEmail = user.Email.Trim().ToLower();

    var emailConflict = await _productionDb.Users
        .AsNoTracking()
        .AnyAsync(
            u => u.Email.ToLower() == normalizedEmail,
            cancellationToken
        );

    if (emailConflict)
    {
        conflicts.Add("The email address is already used.");
    }

    // Check user code.
    var userCodeConflict = await _productionDb.Users
        .AsNoTracking()
        .AnyAsync(
            u => u.UserCode == user.UserCode,
            cancellationToken
        );

    if (userCodeConflict)
    {
        conflicts.Add("The user code is already used.");
    }

    // Check Google account identifier.
    var googleAccountConflict = false;

    if (!string.IsNullOrWhiteSpace(user.GoogleSubjectId))
    {
        googleAccountConflict = await _productionDb.Users
            .AsNoTracking()
            .AnyAsync(
                u => u.GoogleSubjectId == user.GoogleSubjectId,
                cancellationToken
            );

        if (googleAccountConflict)
        {
            conflicts.Add(
                "The Google account is already linked to another user."
            );
        }
    }

    // Check participant profile ID and UserId.
    var participantProfileConflict = false;

    if (user.ParticipantProfile is not null)
    {
        var profile = user.ParticipantProfile;

        participantProfileConflict =
            await _productionDb.ParticipantProfiles
                .AsNoTracking()
                .AnyAsync(
                    p => p.Id == profile.Id ||
                         p.UserId == user.Id,
                    cancellationToken
                );

        if (participantProfileConflict)
        {
            conflicts.Add(
                "A conflicting participant profile already exists."
            );
        }
    }

    // Check trainer profile ID and UserId.
    var trainerProfileConflict = false;

    if (user.TrainerProfile is not null)
    {
        var profile = user.TrainerProfile;

        trainerProfileConflict =
            await _productionDb.TrainerProfiles
                .AsNoTracking()
                .AnyAsync(
                    p => p.Id == profile.Id ||
                         p.UserId == user.Id,
                    cancellationToken
                );

        if (trainerProfileConflict)
        {
            conflicts.Add(
                "A conflicting trainer profile already exists."
            );
        }
    }

    return new RecoveryUserDetailsDto
    {
        Id = user.Id,
        UserCode = user.UserCode,
        FullName = user.FullName,
        Email = user.Email,
        MobileNumber = user.MobileNumber,
        Role = user.Role.ToString(),
        Status = user.Status.ToString(),
        IsEmailVerified = user.IsEmailVerified,
        CreatedAt = user.CreatedAt,
        UpdatedAt = user.UpdatedAt,

        AlreadyExistsInProduction = idConflict,

        EmailConflict = emailConflict,
        UserCodeConflict = userCodeConflict,
        GoogleAccountConflict = googleAccountConflict,
        ParticipantProfileConflict = participantProfileConflict,
        TrainerProfileConflict = trainerProfileConflict,

        Conflicts = conflicts,

        ParticipantProfile = user.ParticipantProfile is null
            ? null
            : new RecoveryProfileDto
            {
                Id = user.ParticipantProfile.Id,
                FirstName = user.ParticipantProfile.FirstName,
                MiddleName = user.ParticipantProfile.MiddleName,
                LastName = user.ParticipantProfile.LastName,
                ProfileImageUrl =
                    user.ParticipantProfile.ProfileImageUrl
            },

        TrainerProfile = user.TrainerProfile is null
            ? null
            : new RecoveryProfileDto
            {
                Id = user.TrainerProfile.Id,
                FirstName = user.TrainerProfile.FirstName,
                MiddleName = user.TrainerProfile.MiddleName,
                LastName = user.TrainerProfile.LastName,
                ProfileImageUrl =
                    user.TrainerProfile.ProfileImageUrl
            }
    };
}

    // =========================================================
    // POST /api/admin/recovery/users/{id}/restore
    // RESTORE USER + PARTICIPANT/TRAINER PROFILE
    // =========================================================

    public async Task<RecoveryRestoreResultDto> RestoreAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        await using var recoveryDb = CreateRecoveryDbContext();

        var sourceUser = await recoveryDb.Users
            .AsNoTracking()
            .Include(u => u.ParticipantProfile)
            .Include(u => u.TrainerProfile)
            .FirstOrDefaultAsync(
                u => u.Id == id,
                cancellationToken
            );

        if (sourceUser is null)
        {
            throw new InvalidOperationException(
                "The selected user was not found in the recovery database."
            );
        }

        // -----------------------------------------------------
        // CHECK USER ID
        // -----------------------------------------------------

        var existingId = await _productionDb.Users
            .AnyAsync(u => u.Id == sourceUser.Id, cancellationToken);

        if (existingId)
        {
            throw new InvalidOperationException(
                "A user with this ID already exists in production."
            );
        }

        // -----------------------------------------------------
        // CHECK EMAIL
        // -----------------------------------------------------

        var normalizedEmail = sourceUser.Email.Trim().ToLower();

        var emailExists = await _productionDb.Users
            .AnyAsync(
                u => u.Email.ToLower() == normalizedEmail,
                cancellationToken
            );

        if (emailExists)
        {
            throw new InvalidOperationException(
                "Another production user already uses this email. " +
                "Resolve the email conflict before restoring."
            );
        }

        // -----------------------------------------------------
        // CHECK USER CODE
        // -----------------------------------------------------

        var userCodeExists = await _productionDb.Users
            .AnyAsync(
                u => u.UserCode == sourceUser.UserCode,
                cancellationToken
            );

        if (userCodeExists)
        {
            throw new InvalidOperationException(
                "Another production user already uses this UserCode."
            );
        }

        // -----------------------------------------------------
        // CHECK GOOGLE SUBJECT ID IF PRESENT
        // -----------------------------------------------------

        if (!string.IsNullOrWhiteSpace(sourceUser.GoogleSubjectId))
        {
            var googleIdExists = await _productionDb.Users
                .AnyAsync(
                    u => u.GoogleSubjectId == sourceUser.GoogleSubjectId,
                    cancellationToken
                );

            if (googleIdExists)
            {
                throw new InvalidOperationException(
                    "Another production user already uses this Google account."
                );
            }
        }

        // -----------------------------------------------------
        // CHECK PARTICIPANT PROFILE CONFLICTS
        // -----------------------------------------------------

        if (sourceUser.ParticipantProfile is not null)
        {
            var profile = sourceUser.ParticipantProfile;

            var participantConflict =
                await _productionDb.ParticipantProfiles
                    .AnyAsync(
                        p => p.Id == profile.Id ||
                             p.UserId == sourceUser.Id,
                        cancellationToken
                    );

            if (participantConflict)
            {
                throw new InvalidOperationException(
                    "A conflicting participant profile already exists in production."
                );
            }
        }

        // -----------------------------------------------------
        // CHECK TRAINER PROFILE CONFLICTS
        // -----------------------------------------------------

        if (sourceUser.TrainerProfile is not null)
        {
            var profile = sourceUser.TrainerProfile;

            var trainerConflict =
                await _productionDb.TrainerProfiles
                    .AnyAsync(
                        p => p.Id == profile.Id ||
                             p.UserId == sourceUser.Id,
                        cancellationToken
                    );

            if (trainerConflict)
            {
                throw new InvalidOperationException(
                    "A conflicting trainer profile already exists in production."
                );
            }
        }

        // -----------------------------------------------------
        // RESTORE IN ONE TRANSACTION
        // -----------------------------------------------------

        await using var transaction =
            await _productionDb.Database.BeginTransactionAsync(
                cancellationToken
            );

        try
        {
            // The included profile, if present, is part of the
            // same entity graph and will be inserted with the user.
            _productionDb.Users.Add(sourceUser);

            await _productionDb.SaveChangesAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }

        return new RecoveryRestoreResultDto
        {
            UserId = sourceUser.Id,
            UserCode = sourceUser.UserCode,
            FullName = sourceUser.FullName,
            ParticipantProfileRestored =
                sourceUser.ParticipantProfile is not null,
            TrainerProfileRestored =
                sourceUser.TrainerProfile is not null,
            Message = "User and available profile restored successfully."
        };
    }
}