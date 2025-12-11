using PopoffCrm.Domain.Entities;

namespace PopoffCrm.Application.DTOs;

public record EnvironmentDto(
    Guid Id,
    Guid ProjectId,
    Guid ServerId,
    string Name,
    string Slug,
    bool IsProduction,
    string? FrontendUrl,
    string? ApiUrl,
    string? DockerComposePath,
    string? DockerProjectName,
    string? GitBranch,
    string ProjectName,
    string ServerName);

public record HealthCheckDto(Guid Id, Guid EnvironmentId, HealthStatus Status, DateTime CheckedOn, int? ResponseTimeMs, int? StatusCode, string? Message);
