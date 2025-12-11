using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace PopoffCrm.Infrastructure.Persistence;

public class PopoffCrmDbContextFactory : IDesignTimeDbContextFactory<PopoffCrmDbContext>
{
    public PopoffCrmDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<PopoffCrmDbContext>();
        optionsBuilder.UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=PopoffCrmDb;Trusted_Connection=True;TrustServerCertificate=True;");
        return new PopoffCrmDbContext(optionsBuilder.Options);
    }
}
