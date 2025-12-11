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

        base.OnModelCreating(modelBuilder);
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
