using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<UserModel> Users => Set<UserModel>();

        public DbSet<ParticipantModel> Participants => Set<ParticipantModel>();

        public DbSet<TrainerModel> Trainers => Set<TrainerModel>();

        public DbSet<TrainingProgramModel> TrainingPrograms => Set<TrainingProgramModel>();

        public DbSet<TrainingScheduleModel> TrainingSchedules => Set<TrainingScheduleModel>();

        public DbSet<TrainingAssignmentModel> TrainingAssignments => Set<TrainingAssignmentModel>();

        public DbSet<OtpCodeModel> OtpCodes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ============================================
            // User ↔ Participant (One-to-One)
            // ============================================
            modelBuilder.Entity<UserModel>()
                .HasOne(u => u.Participant)
                .WithOne(p => p.User)
                .HasForeignKey<ParticipantModel>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // ============================================
            // User ↔ Trainer (One-to-One)
            // ============================================
            modelBuilder.Entity<UserModel>()
                .HasOne(u => u.Trainer)
                .WithOne(t => t.User)
                .HasForeignKey<TrainerModel>(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // ============================================
            // TrainingAssignment
            // ============================================
            modelBuilder.Entity<TrainingAssignmentModel>()
                .HasOne(x => x.TrainingProgram)
                .WithMany(x => x.TrainerApplications)
                .HasForeignKey(x => x.TrainingProgramId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TrainingAssignmentModel>()
                .HasOne(x => x.Trainer)
                .WithMany(t => t.Assignments)
                .HasForeignKey(x => x.TrainerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TrainingAssignmentModel>()
                .HasOne(x => x.Admin)
                .WithMany()
                .HasForeignKey(x => x.ApprovedBy)
                .OnDelete(DeleteBehavior.Restrict);

            // ============================================
            // TrainingProgram ↔ Trainer
            // ============================================
            modelBuilder.Entity<TrainingProgramModel>()
                .HasOne(tp => tp.Trainer)
                .WithMany(t => t.TrainingPrograms)
                .HasForeignKey(tp => tp.TrainerId)
                .OnDelete(DeleteBehavior.SetNull);

            // ============================================
            // TrainingSchedule ↔ Trainer
            // ============================================
            modelBuilder.Entity<TrainingScheduleModel>()
                .HasOne(ts => ts.Trainer)
                .WithMany(t => t.TrainingSchedules)
                .HasForeignKey(ts => ts.TrainerId)
                .OnDelete(DeleteBehavior.Restrict);

            // ============================================
            // Unique Constraints
            // ============================================
            modelBuilder.Entity<UserModel>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<UserModel>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<ParticipantModel>()
                .HasIndex(p => p.UserId)
                .IsUnique();

            modelBuilder.Entity<TrainerModel>()
                .HasIndex(t => t.UserId)
                .IsUnique();

            // ============================================
            // Default Values
            // ============================================
            modelBuilder.Entity<UserModel>()
                .Property(u => u.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<ParticipantModel>()
                .Property(p => p.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<TrainerModel>()
                .Property(t => t.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<TrainingProgramModel>()
                .Property(t => t.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<TrainingScheduleModel>()
                .Property(t => t.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<TrainingAssignmentModel>()
                .Property(t => t.AppliedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
}