namespace PopoffCrm.Domain.Entities;

public class Server : AuditedEntity
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? HostName { get; set; }
    public string IpAddress { get; set; } = null!;
    public string ConnectionType { get; set; } = "LocalShell";
    /// <summary>
    /// Additional connection details. When <see cref="ConnectionType"/> is "RemoteAgent",
    /// this property should contain JSON with the agent base URL and API key, for example:
    /// <code>
    /// {
    ///   "baseUrl": "https://agent-hetzner2.example.com",
    ///   "apiKey": "secret-token"
    /// }
    /// </code>
    /// </summary>
    public string? ConnectionData { get; set; }

    public static string RemoteAgentConnectionDataExample => """
    {
      "baseUrl": "https://agent-hetzner2.example.com",
      "apiKey": "secret-token"
    }
    """;

    public bool IsActive { get; set; }

    public ICollection<Environment> Environments { get; set; } = new List<Environment>();
}
