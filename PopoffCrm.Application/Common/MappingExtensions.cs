using PopoffCrm.Application.DTOs;
using PopoffCrm.Domain.Entities;
using EnvironmentEntity = PopoffCrm.Domain.Entities.Environment;

namespace PopoffCrm.Application.Common;

public static class MappingExtensions
{
    public static UserDto ToDto(this User user) => new(user.Id, user.Email, user.DisplayName, user.Role);

    public static ProjectDto ToDto(this Project project) => new(project.Id, project.Name, project.Code, project.Description, project.RepositoryUrl);

    public static ServerDto ToDto(this Server server) => new(
        server.Id,
        server.Name,
        server.ReferenceKey,
        server.Type,
        server.IsActive,
        server.Description);

    public static EnvironmentDto ToDto(this EnvironmentEntity env) => new(
        env.Id,
        env.ProjectId,
        env.ServerId,
        env.Name,
        env.Slug,
        env.IsProduction,
        env.FrontendUrl,
        env.ApiUrl,
        env.DockerComposePath,
        env.DockerProjectName,
        env.GitBranch,
        env.Project?.Name ?? string.Empty,
        env.Server?.Name ?? string.Empty);

    public static DeploymentDto ToDto(this Deployment deployment) => new(
        deployment.Id,
        deployment.EnvironmentId,
        deployment.RequestedByUserId,
        deployment.StartedAt,
        deployment.FinishedAt,
        deployment.Status,
        deployment.Version,
        deployment.Branch,
        deployment.TriggerType,
        deployment.LogExcerpt);

    public static HealthCheckDto ToDto(this HealthCheckResult result) => new(
        result.Id,
        result.EnvironmentId,
        result.Status,
        result.CheckedOn,
        result.ResponseTimeMs,
        result.StatusCode,
        result.Message);

    public static HealthOverviewDto ToOverviewDto(this HealthCheckResult result) => new(
        result.EnvironmentId,
        result.Environment?.ProjectId ?? Guid.Empty,
        result.Environment?.Project?.Name ?? string.Empty,
        result.Environment?.Name ?? string.Empty,
        result.Status,
        result.CheckedOn,
        result.ResponseTimeMs,
        result.StatusCode,
        result.Message);

    public static ProjectErrorLogDto ToDto(this ProjectErrorLog log) => new(
        log.Id,
        log.ProjectId,
        log.EnvironmentId,
        log.OccurredOn,
        log.ErrorType,
        log.Message,
        log.Details,
        log.Source,
        log.Severity,
        log.CorrelationId,
        log.RequestData,
        log.UserId,
        log.IsResolved,
        log.ResolvedOn,
        log.ResolvedByUserId,
        log.CreatedOn,
        log.UpdatedOn);

    public static ProjectAuditLogDto ToDto(this ProjectAuditLog log) => new(
        log.Id,
        log.ProjectId,
        log.EnvironmentId,
        log.Timestamp,
        log.ActionType,
        log.Message,
        log.Data,
        log.UserId,
        log.CorrelationId,
        log.Origin,
        log.CreatedOn,
        log.UpdatedOn);

    public static ProjectPerformanceLogDto ToDto(this ProjectPerformanceLog log) => new(
        log.Id,
        log.ProjectId,
        log.EnvironmentId,
        log.Timestamp,
        log.OperationName,
        log.DurationMs,
        log.ThresholdMs,
        log.IsSlow,
        log.Details,
        log.CreatedOn,
        log.UpdatedOn);
}
