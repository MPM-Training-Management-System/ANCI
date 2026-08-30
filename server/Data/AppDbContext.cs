using Microsoft.EntityFrameworkCore;

using server.Models.Auth;
using server.Models.Otp;
using server.Models.Participant;
using server.Models.Trainer;
namespace server.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    
    public DbSet<TrainerProfile>
    TrainerProfiles
    => Set<TrainerProfile>();
    // ==============================
    // DbSets
    // ==============================
public DbSet<TrainerApplication>
    TrainerApplications =>
    Set<TrainerApplication>();

public DbSet<TrainerApplicationDocument>
    TrainerApplicationDocuments =>
    Set<TrainerApplicationDocument>();
    public DbSet<User> Users => Set<User>();

    public DbSet<OtpVerification> OtpVerifications
        => Set<OtpVerification>();

    public DbSet<ParticipantProfile> ParticipantProfiles
        => Set<ParticipantProfile>();


    // ==============================
    // Model Configuration
    // ==============================

    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);


        // ==========================================
        // USER
        // ==========================================

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(x => x.Id);


            entity.Property(x => x.UserCode)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasIndex(x => x.UserCode)
                .IsUnique();


            entity.Property(x => x.FullName)
                .IsRequired()
                .HasMaxLength(150);


            entity.Property(x => x.Email)
                .IsRequired()
                .HasMaxLength(255);

            entity.HasIndex(x => x.Email)
                .IsUnique();


            entity.Property(x => x.MobileNumber)
                .HasMaxLength(30);


            entity.Property(x => x.PasswordHash)
                .IsRequired();


            entity.Property(x => x.Role)
                .HasConversion<string>()
                .IsRequired();


            entity.Property(x => x.Status)
                .HasConversion<string>()
                .IsRequired();


            entity.Property(x => x.IsEmailVerified)
                .IsRequired();


            entity.Property(x => x.CreatedAt)
                .IsRequired();


            entity.Property(x => x.UpdatedAt)
                .IsRequired();


            // ======================================
            // User 1 : 1 ParticipantProfile
            // ======================================

            entity.HasOne(x => x.ParticipantProfile)
                .WithOne(x => x.User)
                .HasForeignKey<ParticipantProfile>(
                    x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    
        // ==========================================
// TRAINER APPLICATION
// ==========================================

modelBuilder.Entity<TrainerApplication>(
    entity =>
    {
        entity.HasKey(
            x => x.Id
        );


        entity.HasIndex(
            x => x.UserId
        )
        .IsUnique();


        entity.Property(
            x => x.Status
        )
        .HasConversion<string>()
        .IsRequired();


        entity.Property(
            x => x.Specialization
        )
        .IsRequired()
        .HasMaxLength(150);


        entity.Property(
            x => x.CertificationName
        )
        .HasMaxLength(150);


        entity.Property(
            x => x.CertificationNumber
        )
        .HasMaxLength(150);


        entity.Property(
            x => x.AdminRemarks
        )
        .HasMaxLength(1000);


        entity.HasOne(
            x => x.User
        )
        .WithOne(
            x => x.TrainerApplication
        )
        .HasForeignKey<TrainerApplication>(
            x => x.UserId
        )
        .OnDelete(
            DeleteBehavior.Cascade
        );


        entity.HasMany(
            x => x.Documents
        )
        .WithOne(
            x => x.TrainerApplication
        )
        .HasForeignKey(
            x => x.TrainerApplicationId
        )
        .OnDelete(
            DeleteBehavior.Cascade
        );
    }
);
modelBuilder.Entity<TrainerProfile>(
    entity =>
    {
        entity.HasKey(x => x.Id);

        entity.HasIndex(x => x.UserId)
            .IsUnique();

        entity.Property(x => x.Specialization)
            .IsRequired()
            .HasMaxLength(150);

        entity.Property(x => x.Bio)
            .HasMaxLength(1000);

        entity.Property(x => x.ProfileImageUrl)
            .HasMaxLength(1000);

        entity.Property(x => x.IsActive)
            .IsRequired();

        entity.Property(x => x.ActivatedAt)
            .IsRequired(false);

        entity.HasOne(x => x.User)
            .WithOne(x => x.TrainerProfile)
            .HasForeignKey<TrainerProfile>(
                x => x.UserId
            )
            .OnDelete(DeleteBehavior.Cascade);
    }
);

// ==========================================
// TRAINER APPLICATION DOCUMENT
// ==========================================

modelBuilder.Entity<TrainerApplicationDocument>(
    entity =>
    {
        entity.HasKey(x => x.Id);

        entity.Property(x => x.DocumentType)
            .IsRequired()
            .HasMaxLength(100);

        entity.Property(x => x.FileName)
            .IsRequired()
            .HasMaxLength(255);

        entity.Property(x => x.FileUrl)
            .IsRequired()
            .HasMaxLength(1000);

        entity.Property(x => x.Status)
            .HasConversion<string>()
            .IsRequired();

        entity.Property(x => x.ReviewRemarks)
            .HasMaxLength(1000);

        entity.HasOne(
                x => x.TrainerApplication
            )
            .WithMany(
                x => x.Documents
            )
            .HasForeignKey(
                x => x.TrainerApplicationId
            )
            .OnDelete(
                DeleteBehavior.Cascade
            );
    }
);

        // ==========================================
        // PARTICIPANT PROFILE
        // ==========================================

        modelBuilder.Entity<ParticipantProfile>(entity =>
        {
            entity.HasKey(x => x.Id);


            entity.HasIndex(x => x.UserId)
                .IsUnique();


            entity.Property(x => x.FirstName)
                .HasMaxLength(100);


            entity.Property(x => x.MiddleName)
                .HasMaxLength(100);


            entity.Property(x => x.LastName)
                .HasMaxLength(100);


            entity.Property(x => x.Address)
                .HasMaxLength(500);


            entity.Property(x => x.Gender)
                .HasMaxLength(50);


            entity.Property(x => x.ProfileImageUrl)
                .HasMaxLength(500);
        });


        // ==========================================
        // OTP VERIFICATION
        // ==========================================

        modelBuilder.Entity<OtpVerification>(entity =>
        {
            entity.HasKey(x => x.Id);


            entity.Property(x => x.OtpCode)
                .IsRequired()
                .HasMaxLength(6);


            entity.Property(x => x.Purpose)
                .HasConversion<string>()
                .IsRequired();


            entity.Property(x => x.ExpiresAt)
                .IsRequired();


            entity.Property(x => x.IsUsed)
                .IsRequired();


            entity.Property(x => x.AttemptCount)
                .IsRequired();


            entity.Property(x => x.CreatedAt)
                .IsRequired();


            entity.HasOne(x => x.User)
                .WithMany(x => x.OtpVerifications)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}