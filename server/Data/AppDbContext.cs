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

        public DbSet<ParticipantModel> Participant => Set<ParticipantModel>();

        public DbSet<TrainingProgramModel> TrainingPrograms => Set<TrainingProgramModel>();

        public DbSet<TrainingScheduleModel> TrainingSchedules => Set<TrainingScheduleModel>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ================================
            // User <-> Participant (One-to-One)
            // ================================
            modelBuilder.Entity<UserModel>()
                .HasOne(u => u.Participant)
                .WithOne(p => p.User)
                .HasForeignKey<ParticipantModel>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // ================================
            // Unique Constraints
            // ================================
            modelBuilder.Entity<UserModel>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<ParticipantModel>()
                .HasIndex(p => p.UserId)
                .IsUnique();

            modelBuilder.Entity<ParticipantModel>()
                .HasIndex(p => p.Email)
                .IsUnique();

            // ================================
            // Default Values
            // ================================
            modelBuilder.Entity<UserModel>()
                .Property(u => u.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");

            modelBuilder.Entity<ParticipantModel>()
                .Property(p => p.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
}