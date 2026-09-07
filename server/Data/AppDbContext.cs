using Microsoft.EntityFrameworkCore;
using server.Models.Attendance;
using server.Models.Auth;
using server.Models.Learning;
using server.Models.Otp;
using server.Models.Participant;
using server.Models.Trainer;
using server.Models.Training;

namespace server.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    
public DbSet<TrainingProgramRequirement>
    TrainingProgramRequirements
    { get; set; } = default!;
    public DbSet<User> Users
        => Set<User>();

    public DbSet<LearningMaterial> LearningMaterials
    => Set<LearningMaterial>();

public DbSet<LearningSectionProgress>
    LearningSectionProgresses
    => Set<LearningSectionProgress>();
    public DbSet<LearningModule> LearningModules
    => Set<LearningModule>();

public DbSet<LearningSection> LearningSections
    => Set<LearningSection>();
    
    public DbSet<OtpVerification> OtpVerifications
        => Set<OtpVerification>();

    public DbSet<ParticipantProfile> ParticipantProfiles
        => Set<ParticipantProfile>();

    public DbSet<TrainerApplication> TrainerApplications
        => Set<TrainerApplication>();

    public DbSet<TrainerApplicationDocument> TrainerApplicationDocuments
        => Set<TrainerApplicationDocument>();

    public DbSet<TrainerProfile> TrainerProfiles
        => Set<TrainerProfile>();

    

    public DbSet<TrainingProgram> TrainingPrograms
        => Set<TrainingProgram>();

    public DbSet<TrainingProgramDocument> TrainingProgramDocuments
        => Set<TrainingProgramDocument>();

    public DbSet<TrainingBatch> TrainingBatches
        => Set<TrainingBatch>();

        public DbSet<TrainingSession> TrainingSessions
    => Set<TrainingSession>();

    public DbSet<TrainerAssignment> TrainerAssignments
        => Set<TrainerAssignment>();

    // ==========================================
    // Enrollment
    // ==========================================

    public DbSet<Enrollment> Enrollments
        => Set<Enrollment>();

    public DbSet<EnrollmentDocument> EnrollmentDocuments
        => Set<EnrollmentDocument>();

public DbSet<AttendanceSession> AttendanceSessions => Set<AttendanceSession>();

public DbSet<AttendanceRecord> AttendanceRecords => Set<AttendanceRecord>();
    // ==========================================
    // Model Configuration
    // ==========================================

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


            // User 1 : 1 ParticipantProfile

            entity.HasOne(x => x.ParticipantProfile)
                .WithOne(x => x.User)
                .HasForeignKey<ParticipantProfile>(
                    x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });



        modelBuilder.Entity<TrainingProgramRequirement>(
    entity =>
    {
        entity.HasKey(x => x.Id);

        entity.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        entity.Property(x => x.Description)
            .HasMaxLength(1000);

        entity.Property(x => x.IsRequired)
            .IsRequired();

        entity.Property(x => x.DisplayOrder)
            .IsRequired();

        entity.HasOne(x => x.TrainingProgram)
            .WithMany(x => x.Requirements)
            .HasForeignKey(x => x.TrainingProgramId)
            .OnDelete(DeleteBehavior.Cascade);

        entity.HasIndex(x => x.TrainingProgramId);
    }
);
        // ==========================================
        // TRAINER APPLICATION
        // ==========================================

        modelBuilder.Entity<TrainerApplication>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.HasIndex(x => x.UserId)
                .IsUnique();

            entity.Property(x => x.Status)
                .HasConversion<string>()
                .IsRequired();

            entity.Property(x => x.Specialization)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(x => x.CertificationName)
                .HasMaxLength(150);

            entity.Property(x => x.CertificationNumber)
                .HasMaxLength(150);

            entity.Property(x => x.AdminRemarks)
                .HasMaxLength(1000);

            entity.HasOne(x => x.User)
                .WithOne(x => x.TrainerApplication)
                .HasForeignKey<TrainerApplication>(
                    x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(x => x.Documents)
                .WithOne(x => x.TrainerApplication)
                .HasForeignKey(x => x.TrainerApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });


        // ==========================================
        // TRAINER PROFILE
        // ==========================================

        modelBuilder.Entity<TrainerProfile>(entity =>
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
                    x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // TrainerProfile 1 : many TrainerAssignment

            entity.HasMany(x => x.Assignments)
                .WithOne(x => x.TrainerProfile)
                .HasForeignKey(x => x.TrainerProfileId)
                .OnDelete(DeleteBehavior.Restrict);
        });


        // ==========================================
        // TRAINER APPLICATION DOCUMENT
        // ==========================================

        modelBuilder.Entity<TrainerApplicationDocument>(entity =>
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

            entity.HasOne(x => x.TrainerApplication)
                .WithMany(x => x.Documents)
                .HasForeignKey(x => x.TrainerApplicationId)
                .OnDelete(DeleteBehavior.Cascade);
        });


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


        // ==========================================
        // TRAINING PROGRAM
        // ==========================================

        modelBuilder.Entity<TrainingProgram>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.ProgramCode)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasIndex(x => x.ProgramCode)
                .IsUnique();

            entity.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(x => x.Description)
                .HasMaxLength(1000);

            entity.Property(x => x.DurationHours)
                .IsRequired();

            entity.Property(x => x.IsActive)
                .IsRequired();

            entity.Property(x => x.CreatedAt)
                .IsRequired();


            // TrainingProgram 1 : many Batches

            entity.HasMany(x => x.Batches)
                .WithOne(x => x.TrainingProgram)
                .HasForeignKey(x => x.TrainingProgramId)
                .OnDelete(DeleteBehavior.Restrict);


            // TrainingProgram 1 : many Documents

            entity.HasMany(x => x.Documents)
                .WithOne(x => x.TrainingProgram)
                .HasForeignKey(x => x.TrainingProgramId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        // ==========================================
// LEARNING MATERIAL
// ==========================================

modelBuilder.Entity<LearningMaterial>(entity =>
{
    entity.HasKey(x => x.Id);

    entity.Property(x => x.Title)
        .IsRequired()
        .HasMaxLength(255);

    entity.Property(x => x.Description)
        .HasMaxLength(2000);

    entity.Property(x => x.MaterialType)
        .IsRequired()
        .HasMaxLength(50);

    entity.Property(x => x.FileUrl)
        .IsRequired()
        .HasMaxLength(1000);

    entity.Property(x => x.PublicId)
        .HasMaxLength(500);

    entity.Property(x => x.FileName)
        .HasMaxLength(255);

    entity.Property(x => x.ContentType)
        .HasMaxLength(150);

    entity.Property(x => x.FileSize)
        .IsRequired(false);

    entity.Property(x => x.IsPublished)
        .IsRequired();

    entity.Property(x => x.CreatedAt)
        .IsRequired();

    entity.Property(x => x.UpdatedAt)
        .IsRequired(false);

    entity.HasIndex(x => x.TrainingBatchId);

    entity.HasIndex(x => new
    {
        x.TrainingBatchId,
        x.Title
    });

    entity.HasOne(x => x.TrainingBatch)
    .WithMany(x => x.LearningMaterials)
    .HasForeignKey(x => x.TrainingBatchId)
    .OnDelete(DeleteBehavior.Cascade);
});

// ==========================================
// LEARNING MODULE
// ==========================================

modelBuilder.Entity<LearningModule>(entity =>
{
    entity.HasKey(x => x.Id);

    entity.Property(x => x.ModuleNumber)
        .IsRequired();

    entity.Property(x => x.Title)
        .IsRequired()
        .HasMaxLength(255);

    entity.Property(x => x.Description)
        .HasMaxLength(2000);

    entity.Property(x => x.DisplayOrder)
        .IsRequired();

    entity.Property(x => x.CreatedAt)
        .IsRequired();

    entity.Property(x => x.UpdatedAt)
        .IsRequired(false);

    entity.HasIndex(x => new
    {
        x.LearningMaterialId,
        x.ModuleNumber
    })
    .IsUnique();

    entity.HasIndex(x => new
    {
        x.LearningMaterialId,
        x.DisplayOrder
    });

    entity.HasOne(x => x.LearningMaterial)
        .WithMany(x => x.Modules)
        .HasForeignKey(x => x.LearningMaterialId)
        .OnDelete(DeleteBehavior.Cascade);
});
// ==========================================
// LEARNING SECTION
// ==========================================

modelBuilder.Entity<LearningSection>(entity =>
{
    entity.HasKey(x => x.Id);

    entity.Property(x => x.SectionNumber)
        .IsRequired();

    entity.Property(x => x.Title)
        .IsRequired()
        .HasMaxLength(255);

    entity.Property(x => x.ContentType)
        .IsRequired()
        .HasMaxLength(50);

    entity.Property(x => x.Content)
        .HasMaxLength(10000);

    entity.Property(x => x.MediaUrl)
        .HasMaxLength(1000);

    entity.Property(x => x.DisplayOrder)
        .IsRequired();

    entity.Property(x => x.CreatedAt)
        .IsRequired();

    entity.Property(x => x.UpdatedAt)
        .IsRequired(false);

    entity.HasIndex(x => new
    {
        x.LearningModuleId,
        x.SectionNumber
    })
    .IsUnique();

    entity.HasIndex(x => new
    {
        x.LearningModuleId,
        x.DisplayOrder
    });

    entity.HasOne(x => x.LearningModule)
        .WithMany(x => x.Sections)
        .HasForeignKey(x => x.LearningModuleId)
        .OnDelete(DeleteBehavior.Cascade);
});

        // ==========================================
        // TRAINING PROGRAM DOCUMENT
        // ==========================================

        modelBuilder.Entity<TrainingProgramDocument>(entity =>
        {
            entity.HasKey(x => x.Id);

            

            entity.Property(x => x.DocumentName)
                .IsRequired()
                .HasMaxLength(255);

            entity.Property(x => x.FileUrl)
                .IsRequired()
                .HasMaxLength(1000);

            entity.Property(x => x.PublicId)
                .HasMaxLength(500);

            entity.Property(x => x.UploadedAt)
                .IsRequired();


            entity.HasOne(x => x.TrainingProgram)
                .WithMany(x => x.Documents)
                .HasForeignKey(x => x.TrainingProgramId)
                .OnDelete(DeleteBehavior.Cascade);
        });

modelBuilder.Entity<LearningSectionProgress>(entity =>
{
    entity.ToTable("LearningSectionProgress");

    entity.HasKey(x => x.Id);

    entity.Property(x => x.IsRead)
        .IsRequired();

    entity.Property(x => x.ReadAt)
        .IsRequired(false);

    entity.Property(x => x.LastReadAt)
        .IsRequired();

    entity.HasIndex(x => new
    {
        x.EnrollmentId,
        x.LearningSectionId
    })
    .IsUnique();

    entity.HasOne(x => x.Enrollment)
        .WithMany(x => x.LearningSectionProgresses)
        .HasForeignKey(x => x.EnrollmentId)
        .OnDelete(DeleteBehavior.Cascade);

    entity.HasOne(x => x.LearningSection)
        .WithMany(x => x.Progresses)
        .HasForeignKey(x => x.LearningSectionId)
        .OnDelete(DeleteBehavior.Cascade);
});

      modelBuilder.Entity<TrainingBatch>(entity =>
{
    entity.HasKey(x => x.Id);

    entity.Property(x => x.BatchCode)
        .IsRequired()
        .HasMaxLength(50);

    entity.HasIndex(x => x.BatchCode)
        .IsUnique();

    entity.Property(x => x.Location)
        .HasMaxLength(255);

    entity.Property(x => x.StartDate)
        .IsRequired();

    entity.Property(x => x.EndDate)
        .IsRequired();

    entity.Property(x => x.StartTime)
        .IsRequired(false);

    entity.Property(x => x.EndTime)
        .IsRequired(false);

    
    entity.Property(x => x.Capacity)
        .IsRequired();

    entity.Property(x => x.Status)
        .HasConversion<string>()
        .IsRequired();

    entity.Property(x => x.ScheduleStatus)
        .HasConversion<string>()
        .IsRequired();

    entity.Property(x => x.IncludeWeekends)
        .IsRequired();

    entity.HasOne(x => x.TrainingProgram)
        .WithMany(x => x.Batches)
        .HasForeignKey(x => x.TrainingProgramId)
        .OnDelete(DeleteBehavior.Restrict);

    entity.HasMany(x => x.TrainerAssignments)
        .WithOne(x => x.TrainingBatch)
        .HasForeignKey(x => x.TrainingBatchId)
        .OnDelete(DeleteBehavior.Restrict);

    entity.HasMany(x => x.Enrollments)
        .WithOne(x => x.TrainingBatch)
        .HasForeignKey(x => x.TrainingBatchId)
        .OnDelete(DeleteBehavior.Restrict);

    entity.HasMany(x => x.TrainingSessions)
        .WithOne(x => x.TrainingBatch)
        .HasForeignKey(x => x.TrainingBatchId)
        .OnDelete(DeleteBehavior.Cascade);
});

// ==========================================
// TRAINING SESSION
// ==========================================

modelBuilder.Entity<TrainingSession>(entity =>
{
    entity.HasKey(x => x.Id);

    entity.Property(x => x.SessionNumber)
        .IsRequired();

    entity.Property(x => x.SessionDate)
        .IsRequired();

    entity.Property(x => x.StartTime)
        .IsRequired();

    entity.Property(x => x.EndTime)
        .IsRequired();

    entity.Property(x => x.DurationHours)
        .HasPrecision(8, 2)
        .IsRequired();

    entity.Property(x => x.Status)
        .HasConversion<string>()
        .IsRequired();

    entity.HasIndex(x => new
    {
        x.TrainingBatchId,
        x.SessionDate
    });

    entity.HasIndex(x => new
    {
        x.TrainingBatchId,
        x.SessionNumber
    })
    .IsUnique();

    entity.HasOne(x => x.TrainingBatch)
        .WithMany(x => x.TrainingSessions)
        .HasForeignKey(x => x.TrainingBatchId)
        .OnDelete(DeleteBehavior.Cascade);
});

        // ==========================================
        // TRAINER ASSIGNMENT
        // ==========================================

        modelBuilder.Entity<TrainerAssignment>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.HasIndex(x => x.TrainerProfileId);

            entity.HasIndex(x => x.TrainingBatchId);

            entity.HasIndex(x => x.AssignedByUserId);

            entity.Property(x => x.AssignedAt)
                .IsRequired();

            entity.Property(x => x.IsActive)
                .IsRequired();

            entity.HasOne(x => x.TrainerProfile)
                .WithMany(x => x.Assignments)
                .HasForeignKey(x => x.TrainerProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.TrainingBatch)
                .WithMany(x => x.TrainerAssignments)
                .HasForeignKey(x => x.TrainingBatchId)
                .OnDelete(DeleteBehavior.Restrict);
        });


        // ==========================================
        // ENROLLMENT
        // ==========================================

        modelBuilder.Entity<Enrollment>(entity =>
        {
            entity.HasKey(x => x.Id);

            // Participant cannot enroll twice
            // in the same training batch.

            entity.HasIndex(x => new
            {
                x.ParticipantProfileId,
                x.TrainingBatchId
            })
            .IsUnique();

            entity.Property(x => x.Status)
                .HasConversion<string>()
                .IsRequired();

            entity.Property(x => x.EnrolledAt)
                .IsRequired();

            entity.Property(x => x.ReviewRemarks)
                .HasMaxLength(1000);

            entity.HasOne(x => x.ParticipantProfile)
                .WithMany(x => x.Enrollments)
                .HasForeignKey(x => x.ParticipantProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(x => x.TrainingBatch)
                .WithMany(x => x.Enrollments)
                .HasForeignKey(x => x.TrainingBatchId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(x => x.Documents)
                .WithOne(x => x.Enrollment)
                .HasForeignKey(x => x.EnrollmentId)
                .OnDelete(DeleteBehavior.Cascade);
        });


        // ==========================================
        // ENROLLMENT DOCUMENT
        // ==========================================

        modelBuilder.Entity<EnrollmentDocument>(entity =>
        {
            entity.HasKey(x => x.Id);

            

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

            entity.Property(x => x.UploadedAt)
                .IsRequired();

            entity.HasOne(x => x.Enrollment)
                .WithMany(x => x.Documents)
                .HasForeignKey(x => x.EnrollmentId)
                .OnDelete(DeleteBehavior.Cascade);
        });
 // ==========================================
// ATTENDANCE SESSION
// ==========================================

modelBuilder.Entity<AttendanceSession>(entity =>
{
    entity.HasKey(x => x.Id);

    entity.Property(x => x.Status)
        .HasConversion<string>()
        .IsRequired();

    entity.Property(x => x.ManualAttendanceStatus)
        .HasConversion<string>()
        .IsRequired();

    entity.Property(x => x.OpenedAt)
        .IsRequired();

    entity.Property(x => x.ClosedAt)
        .IsRequired(false);

    entity.Property(x => x.OpenedByUserId)
        .IsRequired();

    entity.HasIndex(x => x.TrainingBatchId);

    entity.HasIndex(x => x.Status);

    entity.HasOne(x => x.TrainingBatch)
        .WithMany(x => x.AttendanceSessions)
        .HasForeignKey(x => x.TrainingBatchId)
        .OnDelete(DeleteBehavior.Restrict);

    entity.HasOne(x => x.TrainingSession)
    .WithMany(x => x.AttendanceSessions)
    .HasForeignKey(x => x.TrainingSessionId)
    .OnDelete(DeleteBehavior.Restrict);


    entity.HasMany(x => x.Records)
        .WithOne(x => x.AttendanceSession)
        .HasForeignKey(x => x.AttendanceSessionId)
        .OnDelete(DeleteBehavior.Cascade);
    

});


// ==========================================
// ATTENDANCE RECORD
// ==========================================

modelBuilder.Entity<AttendanceRecord>(entity =>
{
    entity.HasKey(x => x.Id);

    entity.Property(x => x.Status)
        .HasConversion<string>()
        .IsRequired();

    entity.Property(x => x.Method)
        .HasMaxLength(50);

    entity.Property(x => x.AttendanceDate)
        .IsRequired();

    entity.Property(x => x.TimeIn)
        .IsRequired(false);

    entity.Property(x => x.TimeOut)
        .IsRequired(false);

    entity.HasIndex(x => x.AttendanceSessionId);

    entity.HasIndex(x => x.EnrollmentId);

    // ==========================================
    // ONE ATTENDANCE PER ENROLLMENT PER DAY
    // ==========================================
    //
    // QR + Manual use the same record.
    //
    // Example:
    //
    // Enrollment A + Sept 4 = allowed
    // Enrollment A + Sept 4 = duplicate
    // Enrollment A + Sept 5 = allowed
    //
    entity.HasIndex(x => new
{
    x.EnrollmentId,
    x.AttendanceSessionId
})
.IsUnique();
    entity.HasOne(x => x.AttendanceSession)
        .WithMany(x => x.Records)
        .HasForeignKey(x => x.AttendanceSessionId)
        .OnDelete(DeleteBehavior.Cascade);

    entity.HasOne(x => x.Enrollment)
        .WithMany()
        .HasForeignKey(x => x.EnrollmentId)
        .OnDelete(DeleteBehavior.Restrict);
});
    }

    
    

    
}