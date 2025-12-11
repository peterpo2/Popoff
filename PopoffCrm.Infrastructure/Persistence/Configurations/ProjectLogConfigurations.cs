using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PopoffCrm.Domain.Entities;

namespace PopoffCrm.Infrastructure.Persistence.Configurations;

public class ProjectErrorLogConfiguration : IEntityTypeConfiguration<ProjectErrorLog>
{
    public void Configure(EntityTypeBuilder<ProjectErrorLog> builder)
    {
        builder.HasKey(l => l.Id);
        builder.Property(l => l.ErrorType).IsRequired();
        builder.Property(l => l.Message).IsRequired();
        builder.Property(l => l.Source).IsRequired();
        builder.Property(l => l.CorrelationId).HasMaxLength(256);

        builder.HasIndex(l => new { l.ProjectId, l.EnvironmentId, l.Severity });
        builder.HasIndex(l => l.OccurredOn);

        builder.HasOne(l => l.Project)
            .WithMany()
            .HasForeignKey(l => l.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(l => l.Environment)
            .WithMany()
            .HasForeignKey(l => l.EnvironmentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ProjectAuditLogConfiguration : IEntityTypeConfiguration<ProjectAuditLog>
{
    public void Configure(EntityTypeBuilder<ProjectAuditLog> builder)
    {
        builder.HasKey(l => l.Id);
        builder.Property(l => l.ActionType).IsRequired();
        builder.Property(l => l.Message).IsRequired();
        builder.Property(l => l.Origin).IsRequired();

        builder.HasIndex(l => new { l.ProjectId, l.EnvironmentId });
        builder.HasIndex(l => l.Timestamp);

        builder.HasOne(l => l.Project)
            .WithMany()
            .HasForeignKey(l => l.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(l => l.Environment)
            .WithMany()
            .HasForeignKey(l => l.EnvironmentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class ProjectPerformanceLogConfiguration : IEntityTypeConfiguration<ProjectPerformanceLog>
{
    public void Configure(EntityTypeBuilder<ProjectPerformanceLog> builder)
    {
        builder.HasKey(l => l.Id);
        builder.Property(l => l.OperationName).IsRequired();

        builder.HasIndex(l => new { l.ProjectId, l.EnvironmentId });
        builder.HasIndex(l => l.Timestamp);
        builder.HasIndex(l => l.IsSlow);

        builder.HasOne(l => l.Project)
            .WithMany()
            .HasForeignKey(l => l.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(l => l.Environment)
            .WithMany()
            .HasForeignKey(l => l.EnvironmentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
