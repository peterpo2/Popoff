namespace PopoffCrm.Domain.Entities;

public class Server : AuditedEntity
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? HostName { get; set; }
    public string IpAddress { get; set; } = null!;
    public string ConnectionType { get; set; } = "LocalShell";
    public string? ConnectionData { get; set; }
    public bool IsActive { get; set; }

    public ICollection<Environment> Environments { get; set; } = new List<Environment>();
}
