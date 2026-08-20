using server.Models.Auth;
using Microsoft.EntityFrameworkCore;
using server.Models.Otp;
namespace server.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<OtpVerification> OtpVerifications
    => Set<OtpVerification>();
    protected override void OnModelCreating(
        ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

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
        });
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