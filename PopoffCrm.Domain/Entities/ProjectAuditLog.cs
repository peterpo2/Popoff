namespace PopoffCrm.Domain.Entities;

public class ProjectAuditLog : AuditedEntity
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public Guid EnvironmentId { get; set; }
    public Environment Environment { get; set; } = null!;

    public DateTime Timestamp { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Data { get; set; } = string.Empty;
    public Guid? UserId { get; set; }
    public string CorrelationId { get; set; } = string.Empty;
    public string Origin { get; set; } = string.Empty;
}
