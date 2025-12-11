using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace PopoffCrm.Infrastructure.Persistence;

public class PopoffCrmDbContextFactory : IDesignTimeDbContextFactory<PopoffCrmDbContext>
{
    public PopoffCrmDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<PopoffCrmDbContext>();
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__Default")
            ?? Environment.GetEnvironmentVariable("CONNECTIONSTRINGS__DEFAULT")
            ?? "Server=localhost,1433;Database=PopoffCrmDb;User Id=sa;Password=Your_password123;TrustServerCertificate=True;";

        optionsBuilder.UseSqlServer(connectionString);
        return new PopoffCrmDbContext(optionsBuilder.Options);
    }
}
