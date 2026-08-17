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

        // ============================================
        // DbSets
        // ============================================

        public DbSet<UserModel> Users
            => Set<UserModel>();

        public DbSet<ParticipantModel> Participants
            => Set<ParticipantModel>();

        public DbSet<TrainerModel> Trainers
            => Set<TrainerModel>();

        public DbSet<UserApplicationModel> UserApplications
            => Set<UserApplicationModel>();

        public DbSet<TrainingProgramModel> TrainingPrograms
            => Set<TrainingProgramModel>();

        public DbSet<TrainingScheduleModel> TrainingSchedules
            => Set<TrainingScheduleModel>();

        public DbSet<TrainingAssignmentModel> TrainingAssignments
            => Set<TrainingAssignmentModel>();

        public DbSet<OtpCodeModel> OtpCodes
            => Set<OtpCodeModel>();


        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            // ============================================
            // USER ↔ PARTICIPANT
            // One-to-One
            // ============================================

            modelBuilder.Entity<UserModel>()
                .HasOne(u => u.Participant)
                .WithOne(p => p.User)
                .HasForeignKey<ParticipantModel>(
                    p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);


            // ============================================
            // USER ↔ TRAINER
            // One-to-One
            // ============================================

            modelBuilder.Entity<UserModel>()
                .HasOne(u => u.Trainer)
                .WithOne(t => t.User)
                .HasForeignKey<TrainerModel>(
                    t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);


            // ============================================
            // USER ↔ APPLICATION
            // One-to-One
            //
            // Shared by:
            // Participant
            // Trainer
            // ============================================

            modelBuilder.Entity<UserApplicationModel>()
                .HasOne(a => a.User)
                .WithOne(u => u.Application)
                .HasForeignKey<UserApplicationModel>(
                    a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);


            // ============================================
            // TRAINING ASSIGNMENT ↔ TRAINING PROGRAM
            // ============================================

            modelBuilder.Entity<TrainingAssignmentModel>()
                .HasOne(x => x.TrainingProgram)
                .WithMany(x => x.TrainerApplications)
                .HasForeignKey(x => x.TrainingProgramId)
                .OnDelete(DeleteBehavior.Cascade);


            // ============================================
            // TRAINING ASSIGNMENT ↔ TRAINER
            // ============================================

            modelBuilder.Entity<TrainingAssignmentModel>()
                .HasOne(x => x.Trainer)
                .WithMany(t => t.Assignments)
                .HasForeignKey(x => x.TrainerId)
                .OnDelete(DeleteBehavior.Restrict);


            // ============================================
            // TRAINING ASSIGNMENT ↔ ADMIN
            // ============================================

            modelBuilder.Entity<TrainingAssignmentModel>()
                .HasOne(x => x.Admin)
                .WithMany()
                .HasForeignKey(x => x.ApprovedBy)
                .OnDelete(DeleteBehavior.Restrict);


            // ============================================
            // TRAINING PROGRAM ↔ TRAINER
            // ============================================

            modelBuilder.Entity<TrainingProgramModel>()
                .HasOne(tp => tp.Trainer)
                .WithMany(t => t.TrainingPrograms)
                .HasForeignKey(tp => tp.TrainerId)
                .OnDelete(DeleteBehavior.SetNull);


            // ============================================
            // TRAINING SCHEDULE ↔ TRAINER
            // ============================================

            modelBuilder.Entity<TrainingScheduleModel>()
                .HasOne(ts => ts.Trainer)
                .WithMany(t => t.TrainingSchedules)
                .HasForeignKey(ts => ts.TrainerId)
                .OnDelete(DeleteBehavior.Restrict);


            // ============================================
            // UNIQUE CONSTRAINTS
            // ============================================

            // User Email
            modelBuilder.Entity<UserModel>()
                .HasIndex(u => u.Email)
                .IsUnique();


            // User Username
            modelBuilder.Entity<UserModel>()
                .HasIndex(u => u.Username)
                .IsUnique();


            // Participant UserId
            modelBuilder.Entity<ParticipantModel>()
                .HasIndex(p => p.UserId)
                .IsUnique();


            // Trainer UserId
            modelBuilder.Entity<TrainerModel>()
                .HasIndex(t => t.UserId)
                .IsUnique();


            // Application UserId
            //
            // One application per user
            //
            modelBuilder.Entity<UserApplicationModel>()
                .HasIndex(a => a.UserId)
                .IsUnique();


            // ============================================
            // DEFAULT VALUES
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


            modelBuilder.Entity<UserApplicationModel>()
                .Property(a => a.SubmittedAt)
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