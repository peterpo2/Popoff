namespace PopoffCrm.Domain.Entities;

public class Environment : AuditedEntity
{
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public Guid ServerId { get; set; }
    public Server Server { get; set; } = null!;

    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public bool IsProduction { get; set; }

    public string? FrontendUrl { get; set; }
    public string? ApiUrl { get; set; }
    public string? DockerComposePath { get; set; }
    public string? DockerProjectName { get; set; }
    public string? GitBranch { get; set; }

    public ICollection<Deployment> Deployments { get; set; } = new List<Deployment>();
    public ICollection<HealthCheckResult> HealthChecks { get; set; } = new List<HealthCheckResult>();
}
