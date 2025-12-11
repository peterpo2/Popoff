namespace PopoffCrm.Domain.Entities;

public enum DeploymentStatus
{
    Pending,
    Running,
    Success,
    Failed
}

public class Deployment : AuditedEntity
{
    public Guid EnvironmentId { get; set; }
    public Environment Environment { get; set; } = null!;

    public Guid RequestedByUserId { get; set; }
    public User RequestedByUser { get; set; } = null!;

    public DateTime StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }

    public DeploymentStatus Status { get; set; }

    public string? Version { get; set; }
    public string? Branch { get; set; }
    public string TriggerType { get; set; } = "Manual";

    public string? LogExcerpt { get; set; }
}
