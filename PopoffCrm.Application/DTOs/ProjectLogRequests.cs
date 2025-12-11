using System.ComponentModel.DataAnnotations;

namespace PopoffCrm.Application.DTOs;

public class CreateProjectErrorLogRequest
{
    [Required]
    public Guid ProjectId { get; set; }

    [Required]
    public Guid EnvironmentId { get; set; }

    [Required]
    public DateTime OccurredOn { get; set; }

    [Required]
    public string ErrorType { get; set; } = string.Empty;

    [Required]
    public string Message { get; set; } = string.Empty;

    public string Details { get; set; } = string.Empty;

    public string Source { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int Severity { get; set; }

    public string CorrelationId { get; set; } = string.Empty;

    public string RequestData { get; set; } = string.Empty;

    public Guid? UserId { get; set; }

    public bool IsResolved { get; set; }

    public DateTime? ResolvedOn { get; set; }

    public Guid? ResolvedByUserId { get; set; }
}

public class CreateProjectAuditLogRequest
{
    [Required]
    public Guid ProjectId { get; set; }

    [Required]
    public Guid EnvironmentId { get; set; }

    [Required]
    public DateTime Timestamp { get; set; }

    [Required]
    public string ActionType { get; set; } = string.Empty;

    [Required]
    public string Message { get; set; } = string.Empty;

    public string Data { get; set; } = string.Empty;

    public Guid? UserId { get; set; }

    public string CorrelationId { get; set; } = string.Empty;

    public string Origin { get; set; } = string.Empty;
}

public class CreateProjectPerformanceLogRequest
{
    [Required]
    public Guid ProjectId { get; set; }

    [Required]
    public Guid EnvironmentId { get; set; }

    [Required]
    public DateTime Timestamp { get; set; }

    [Required]
    public string OperationName { get; set; } = string.Empty;

    [Range(0, long.MaxValue)]
    public long DurationMs { get; set; }

    [Range(0, long.MaxValue)]
    public long? ThresholdMs { get; set; }

    public bool IsSlow { get; set; }

    public string Details { get; set; } = string.Empty;
}
