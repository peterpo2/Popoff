namespace PopoffCrm.Domain.Entities;

public class ProjectErrorLog : AuditedEntity
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public Guid EnvironmentId { get; set; }
    public Environment Environment { get; set; } = null!;

    public DateTime OccurredOn { get; set; }
    public string ErrorType { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string Source { get; set; } = string.Empty;
    public int Severity { get; set; }
    public string CorrelationId { get; set; } = string.Empty;
    public string RequestData { get; set; } = string.Empty;
    public Guid? UserId { get; set; }
    public bool IsResolved { get; set; }
    public DateTime? ResolvedOn { get; set; }
    public Guid? ResolvedByUserId { get; set; }
}
