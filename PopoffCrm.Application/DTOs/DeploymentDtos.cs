using PopoffCrm.Domain.Entities;

namespace PopoffCrm.Application.DTOs;

public record DeploymentDto(
    Guid Id,
    Guid EnvironmentId,
    Guid RequestedByUserId,
    DateTime StartedAt,
    DateTime? FinishedAt,
    DeploymentStatus Status,
    string? Version,
    string? Branch,
    string TriggerType,
    string? LogExcerpt);
