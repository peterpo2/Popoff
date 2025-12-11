using Microsoft.EntityFrameworkCore;
using PopoffCrm.Application.Common;
using PopoffCrm.Domain.Entities;
using PopoffCrm.Infrastructure.Extensions;
using EnvironmentEntity = PopoffCrm.Domain.Entities.Environment;

namespace PopoffCrm.Infrastructure.Persistence;

public class PopoffCrmDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Server> Servers => Set<Server>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<EnvironmentEntity> Environments => Set<EnvironmentEntity>();
    public DbSet<Deployment> Deployments => Set<Deployment>();
    public DbSet<HealthCheckResult> HealthCheckResults => Set<HealthCheckResult>();

    public PopoffCrmDbContext(DbContextOptions options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyGlobalFilters<AuditedEntity>(e => !e.IsDeleted);

        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<Project>().HasIndex(p => p.Code).IsUnique();
        modelBuilder.Entity<EnvironmentEntity>().HasIndex(e => new { e.ProjectId, e.Slug }).IsUnique();

        modelBuilder.Entity<EnvironmentEntity>()
            .HasOne(e => e.Project)
            .WithMany(p => p.Environments)
            .HasForeignKey(e => e.ProjectId);

        modelBuilder.Entity<EnvironmentEntity>()
            .HasOne(e => e.Server)
            .WithMany(s => s.Environments)
            .HasForeignKey(e => e.ServerId);

        modelBuilder.Entity<Deployment>()
            .HasOne(d => d.Environment)
            .WithMany(e => e.Deployments)
            .HasForeignKey(d => d.EnvironmentId);

        modelBuilder.Entity<Deployment>()
            .HasOne(d => d.RequestedByUser)
            .WithMany(u => u.Deployments)
            .HasForeignKey(d => d.RequestedByUserId);

        modelBuilder.Entity<HealthCheckResult>()
            .HasOne(h => h.Environment)
            .WithMany(e => e.HealthChecks)
            .HasForeignKey(h => h.EnvironmentId);

        Seed(modelBuilder);

        base.OnModelCreating(modelBuilder);
    }

    private static void Seed(ModelBuilder modelBuilder)
    {
        var adminId = Guid.Parse("b4f1bf76-df8a-4b77-9e74-8e5898dd34b8");
        var serverId = Guid.Parse("6f7f8455-43c2-4b61-86a3-a0c24b5c7d77");
        var projectId = Guid.Parse("c0aa483c-f17e-47a1-98dc-8b5e0c9cba10");
        var envTestId = Guid.Parse("b4fa7483-59ae-4d0f-8ebd-0d0a0c6a1b44");
        var envProdId = Guid.Parse("832a84f0-5d6d-4f1b-8d96-7716b7a6c1a0");

        var seedCreatedOn = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var adminHash = "10000.D73617EBFC538BD6ED61FB63D075601C.3E92952FDA90A4D3BB7CCB80A6D38DDB17AEA347E520408CF8A4B4CF9D892457";

        modelBuilder.Entity<User>().HasData(new User
        {
            Id = adminId,
            Email = "admin@popoffcrm.com",
            DisplayName = "Petar Popov",
            PasswordHash = adminHash,
            Role = "Admin",
            CreatedOn = seedCreatedOn
        });

        modelBuilder.Entity<Server>().HasData(new Server
        {
            Id = serverId,
            Name = "Hetzner-Local-Dev",
            Description = "Hetzner local development server",
            HostName = "Hetzner-Local-Dev",
            IpAddress = "127.0.0.1",
            ConnectionType = "LocalShell",
            ConnectionData = null,
            IsActive = true,
            CreatedOn = seedCreatedOn
        });

        modelBuilder.Entity<Project>().HasData(new Project
        {
            Id = projectId,
            Name = "Latelina",
            Code = "LTLNA",
            Description = "Latelina project",
            RepositoryUrl = null,
            CreatedOn = seedCreatedOn
        });

        modelBuilder.Entity<EnvironmentEntity>().HasData(
            new EnvironmentEntity
            {
                Id = envTestId,
                ProjectId = projectId,
                ServerId = serverId,
                Name = "Test",
                Slug = "test",
                IsProduction = false,
                FrontendUrl = "http://localhost:3001",
                ApiUrl = "http://localhost:5000",
                DockerComposePath = "/opt/latelina-test/docker-compose.yml",
                DockerProjectName = "latelina-test",
                GitBranch = "develop",
                CreatedOn = seedCreatedOn
            },
            new EnvironmentEntity
            {
                Id = envProdId,
                ProjectId = projectId,
                ServerId = serverId,
                Name = "Prod",
                Slug = "prod",
                IsProduction = true,
                FrontendUrl = "http://localhost:3000",
                ApiUrl = "http://localhost:5000",
                DockerComposePath = "/opt/latelina-prod/docker-compose.yml",
                DockerProjectName = "latelina",
                GitBranch = "main",
                CreatedOn = seedCreatedOn
            });
    }

    public override int SaveChanges()
    {
        ApplyAuditInfo();
        return base.SaveChanges();
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyAuditInfo();
        return await base.SaveChangesAsync(cancellationToken);
    }

    private void ApplyAuditInfo()
    {
        foreach (var entry in ChangeTracker.Entries<AuditedEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedOn = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedOn = DateTime.UtcNow;
                    break;
                case EntityState.Deleted:
                    entry.State = EntityState.Modified;
                    entry.Entity.IsDeleted = true;
                    entry.Entity.UpdatedOn = DateTime.UtcNow;
                    break;
            }
        }
    }
}
