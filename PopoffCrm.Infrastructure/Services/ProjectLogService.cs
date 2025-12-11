using Microsoft.EntityFrameworkCore;
using PopoffCrm.Application.Common;
using PopoffCrm.Application.DTOs;
using PopoffCrm.Application.Interfaces;
using PopoffCrm.Domain.Entities;
using PopoffCrm.Infrastructure.Persistence;

namespace PopoffCrm.Infrastructure.Services;

public class ProjectLogService : IProjectLogService
{
    private readonly PopoffCrmDbContext _dbContext;

    public ProjectLogService(PopoffCrmDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ProjectErrorLogDto> CreateErrorLogAsync(CreateProjectErrorLogRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureProjectAndEnvironmentAsync(request.ProjectId, request.EnvironmentId, cancellationToken);

        var log = new ProjectErrorLog
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            EnvironmentId = request.EnvironmentId,
            OccurredOn = request.OccurredOn,
            ErrorType = request.ErrorType,
            Message = request.Message,
            Details = request.Details,
            Source = request.Source,
            Severity = request.Severity,
            CorrelationId = request.CorrelationId,
            RequestData = request.RequestData,
            UserId = request.UserId,
            IsResolved = request.IsResolved,
            ResolvedOn = request.ResolvedOn,
            ResolvedByUserId = request.ResolvedByUserId
        };

        _dbContext.ProjectErrorLogs.Add(log);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return log.ToDto();
    }

    public async Task<ProjectAuditLogDto> CreateAuditLogAsync(CreateProjectAuditLogRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureProjectAndEnvironmentAsync(request.ProjectId, request.EnvironmentId, cancellationToken);

        var log = new ProjectAuditLog
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            EnvironmentId = request.EnvironmentId,
            Timestamp = request.Timestamp,
            ActionType = request.ActionType,
            Message = request.Message,
            Data = request.Data,
            UserId = request.UserId,
            CorrelationId = request.CorrelationId,
            Origin = request.Origin
        };

        _dbContext.ProjectAuditLogs.Add(log);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return log.ToDto();
    }

    public async Task<ProjectPerformanceLogDto> CreatePerformanceLogAsync(CreateProjectPerformanceLogRequest request, CancellationToken cancellationToken = default)
    {
        await EnsureProjectAndEnvironmentAsync(request.ProjectId, request.EnvironmentId, cancellationToken);

        var isSlow = request.IsSlow;
        if (!isSlow && request.ThresholdMs.HasValue)
        {
            isSlow = request.DurationMs > request.ThresholdMs.Value;
        }

        var log = new ProjectPerformanceLog
        {
            Id = Guid.NewGuid(),
            ProjectId = request.ProjectId,
            EnvironmentId = request.EnvironmentId,
            Timestamp = request.Timestamp,
            OperationName = request.OperationName,
            DurationMs = request.DurationMs,
            ThresholdMs = request.ThresholdMs,
            IsSlow = isSlow,
            Details = request.Details
        };

        _dbContext.ProjectPerformanceLogs.Add(log);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return log.ToDto();
    }

    public async Task<IEnumerable<ProjectErrorLogDto>> GetErrorLogsAsync(Guid projectId, Guid? environmentId, int? severity, string? text, CancellationToken cancellationToken = default)
    {
        await EnsureProjectExistsAsync(projectId, cancellationToken);

        var query = _dbContext.ProjectErrorLogs
            .AsNoTracking()
            .Where(l => l.ProjectId == projectId);

        if (environmentId.HasValue)
        {
            query = query.Where(l => l.EnvironmentId == environmentId.Value);
        }

        if (severity.HasValue)
        {
            query = query.Where(l => l.Severity >= severity.Value);
        }

        if (!string.IsNullOrWhiteSpace(text))
        {
            query = query.Where(l => l.Message.Contains(text!) || l.Details.Contains(text!));
        }

        var logs = await query
            .OrderByDescending(l => l.OccurredOn)
            .ThenByDescending(l => l.CreatedOn)
            .ToListAsync(cancellationToken);

        return logs.Select(l => l.ToDto());
    }

    public async Task<IEnumerable<ProjectPerformanceLogDto>> GetPerformanceLogsAsync(Guid projectId, Guid? environmentId, bool slowOnly, CancellationToken cancellationToken = default)
    {
        await EnsureProjectExistsAsync(projectId, cancellationToken);

        var query = _dbContext.ProjectPerformanceLogs
            .AsNoTracking()
            .Where(l => l.ProjectId == projectId);

        if (environmentId.HasValue)
        {
            query = query.Where(l => l.EnvironmentId == environmentId.Value);
        }

        if (slowOnly)
        {
            query = query.Where(l => l.IsSlow);
        }

        var logs = await query
            .OrderByDescending(l => l.Timestamp)
            .ThenByDescending(l => l.CreatedOn)
            .ToListAsync(cancellationToken);

        return logs.Select(l => l.ToDto());
    }

    private async Task EnsureProjectExistsAsync(Guid projectId, CancellationToken cancellationToken)
    {
        var exists = await _dbContext.Projects.AsNoTracking().AnyAsync(p => p.Id == projectId, cancellationToken);
        if (!exists)
        {
            throw new KeyNotFoundException($"Project {projectId} was not found.");
        }
    }

    private async Task EnsureProjectAndEnvironmentAsync(Guid projectId, Guid environmentId, CancellationToken cancellationToken)
    {
        await EnsureProjectExistsAsync(projectId, cancellationToken);

        var environmentExists = await _dbContext.Environments.AsNoTracking()
            .AnyAsync(e => e.Id == environmentId && e.ProjectId == projectId, cancellationToken);

        if (!environmentExists)
        {
            throw new KeyNotFoundException($"Environment {environmentId} was not found for project {projectId}.");
        }
    }
}
