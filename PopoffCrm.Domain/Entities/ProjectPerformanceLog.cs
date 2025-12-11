namespace PopoffCrm.Domain.Entities;

public class ProjectPerformanceLog : AuditedEntity
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public Guid EnvironmentId { get; set; }
    public Environment Environment { get; set; } = null!;

    public DateTime Timestamp { get; set; }
    public string OperationName { get; set; } = string.Empty;
    public long DurationMs { get; set; }
    public long? ThresholdMs { get; set; }
    public bool IsSlow { get; set; }
    public string Details { get; set; } = string.Empty;
}
