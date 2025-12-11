namespace PopoffCrm.Application.DTOs;

public record ProjectErrorLogDto(
    Guid Id,
    Guid ProjectId,
    Guid EnvironmentId,
    DateTime OccurredOn,
    string ErrorType,
    string Message,
    string Details,
    string Source,
    int Severity,
    string CorrelationId,
    string RequestData,
    Guid? UserId,
    bool IsResolved,
    DateTime? ResolvedOn,
    Guid? ResolvedByUserId,
    DateTime CreatedOn,
    DateTime? UpdatedOn);

public record ProjectAuditLogDto(
    Guid Id,
    Guid ProjectId,
    Guid EnvironmentId,
    DateTime Timestamp,
    string ActionType,
    string Message,
    string Data,
    Guid? UserId,
    string CorrelationId,
    string Origin,
    DateTime CreatedOn,
    DateTime? UpdatedOn);

public record ProjectPerformanceLogDto(
    Guid Id,
    Guid ProjectId,
    Guid EnvironmentId,
    DateTime Timestamp,
    string OperationName,
    long DurationMs,
    long? ThresholdMs,
    bool IsSlow,
    string Details,
    DateTime CreatedOn,
    DateTime? UpdatedOn);
