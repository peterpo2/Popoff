using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PopoffCrm.Domain.Entities;
using EnvironmentEntity = PopoffCrm.Domain.Entities.Environment;

namespace PopoffCrm.Infrastructure.Persistence;

/// <summary>
/// Applies EF Core migrations and seeds the baseline data set the first time
/// the database is created. Future schema changes must be applied through new
/// EF Core migrations (run "dotnet ef migrations add <Name> -p PopoffCrm.Infrastructure -s PopoffCrm.WebApi").
/// </summary>
public interface IDatabaseInitializer
{
    Task ApplyMigrationsAsync(CancellationToken cancellationToken = default);
    Task SeedAsync(CancellationToken cancellationToken = default);
}

internal class DatabaseInitializer : IDatabaseInitializer
{
    private readonly PopoffCrmDbContext _context;
    private readonly ILogger<DatabaseInitializer> _logger;

    private static readonly Guid AdminId = Guid.Parse("b4f1bf76-df8a-4b77-9e74-8e5898dd34b8");
    private static readonly Guid ServerId = Guid.Parse("6f7f8455-43c2-4b61-86a3-a0c24b5c7d77");
    private static readonly Guid ProjectId = Guid.Parse("c0aa483c-f17e-47a1-98dc-8b5e0c9cba10");
    private static readonly Guid EnvTestId = Guid.Parse("b4fa7483-59ae-4d0f-8ebd-0d0a0c6a1b44");
    private static readonly Guid EnvProdId = Guid.Parse("832a84f0-5d6d-4f1b-8d96-7716b7a6c1a0");

    private const string AdminPasswordHash = "10000.D73617EBFC538BD6ED61FB63D075601C.3E92952FDA90A4D3BB7CCB80A6D38DDB17AEA347E520408CF8A4B4CF9D892457";

    public DatabaseInitializer(PopoffCrmDbContext context, ILogger<DatabaseInitializer> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Applies all pending migrations so the schema always matches the EF Core model
    /// before the API begins handling requests.
    /// </summary>
    public async Task ApplyMigrationsAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Applying database migrations...");
        await _context.Database.MigrateAsync(cancellationToken);
        _logger.LogInformation("Database migrations applied.");
    }

    /// <summary>
    /// Seeds the minimal Latelina dataset only when the database is empty. The routine
    /// is idempotent: if the Latelina project (code "LTLNA") already exists, no new rows
    /// are inserted.
    /// </summary>
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var existingProject = await _context.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Code == "LTLNA", cancellationToken);

        if (existingProject != null)
        {
            _logger.LogInformation("Latelina project already exists; skipping initial seed.");
            return;
        }

        _logger.LogInformation("Seeding initial Latelina project, environments, server, and admin user...");

        var createdOn = DateTime.UtcNow;

        var admin = await _context.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email == "admin@popoffcrm.com", cancellationToken)
            ?? new User
            {
                Id = AdminId,
                Email = "admin@popoffcrm.com",
                DisplayName = "Petar Popov",
                PasswordHash = AdminPasswordHash,
                Role = "Admin",
                CreatedOn = createdOn,
                IsDeleted = false
            };

        var server = await _context.Servers
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.Id == ServerId || s.Name == "Local-Docker-Host", cancellationToken)
            ?? new Server
            {
                Id = ServerId,
                Name = "Local-Docker-Host",
                Description = "Placeholder server running in docker-compose for local testing.",
                HostName = "localhost",
                IpAddress = "127.0.0.1",
                ConnectionType = "LocalShell",
                ConnectionData = null,
                IsActive = true,
                CreatedOn = createdOn,
                IsDeleted = false
            };

        var project = new Project
        {
            Id = ProjectId,
            Name = "Latelina",
            Code = "LTLNA",
            Description = "Gift shop / romantic gifting platform",
            RepositoryUrl = null,
            CreatedOn = createdOn
        };

        var testEnvironment = new EnvironmentEntity
        {
            Id = EnvTestId,
            ProjectId = project.Id,
            ServerId = server.Id,
            Name = "Test",
            Slug = "test",
            IsProduction = false,
            CreatedOn = createdOn
        };

        var prodEnvironment = new EnvironmentEntity
        {
            Id = EnvProdId,
            ProjectId = project.Id,
            ServerId = server.Id,
            Name = "Prod",
            Slug = "prod",
            IsProduction = true,
            CreatedOn = createdOn
        };

        if (admin.IsDeleted)
        {
            admin.IsDeleted = false;
            _context.Users.Update(admin);
        }
        else if (_context.Entry(admin).State == EntityState.Detached)
        {
            await _context.Users.AddAsync(admin, cancellationToken);
        }

        if (server.IsDeleted)
        {
            server.IsDeleted = false;
            _context.Servers.Update(server);
        }
        else if (_context.Entry(server).State == EntityState.Detached)
        {
            await _context.Servers.AddAsync(server, cancellationToken);
        }

        await _context.Projects.AddAsync(project, cancellationToken);
        await _context.Environments.AddRangeAsync(new[] { testEnvironment, prodEnvironment }, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Initial seed completed.");
    }
}
