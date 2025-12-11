using PopoffCrm.Domain.Entities;

namespace PopoffCrm.Application.DTOs;

public record HealthOverviewDto(
    Guid EnvironmentId,
    Guid ProjectId,
    string ProjectName,
    string EnvironmentName,
    HealthStatus Status,
    DateTime CheckedOn,
    int? ResponseTimeMs,
    int? StatusCode,
    string? Message);
