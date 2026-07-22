using server.Models;
using Microsoft.EntityFrameworkCore;



namespace server.Data
{
    public class AppDbContext : DbContext
    {
       
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<UserModel> Users => Set<UserModel>();
         public DbSet<TrainingProgramModel> TrainingPrograms => Set<TrainingProgramModel>();
         public DbSet<TrainingScheduleModel> TrainingSchedules => Set<TrainingScheduleModel>();
        
    }
}