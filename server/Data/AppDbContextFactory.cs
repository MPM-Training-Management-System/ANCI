using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace server.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

            optionsBuilder.UseNpgsql(
                "Host=ep-curly-tree-azjuv1us.c-3.ap-southeast-1.aws.neon.tech;" +
                "Database=ANCIDB;" +
                "Username=neondb_owner;" +
                "Password=npg_U8GSnX4vxZoW;" +
                "SSL Mode=Require;" +
                "Trust Server Certificate=true"
            );

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}