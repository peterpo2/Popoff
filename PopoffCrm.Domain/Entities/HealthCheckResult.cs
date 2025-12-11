namespace PopoffCrm.Domain.Entities;

public enum HealthStatus
{
    Healthy,
    Degraded,
    Down
}

public class HealthCheckResult : AuditedEntity
{
    public Guid EnvironmentId { get; set; }
    public Environment Environment { get; set; } = null!;

    public HealthStatus Status { get; set; }
    public DateTime CheckedOn { get; set; }
    public int? ResponseTimeMs { get; set; }
    public int? StatusCode { get; set; }
    public string? Message { get; set; }
}
