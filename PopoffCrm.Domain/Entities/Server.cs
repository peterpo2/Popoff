namespace PopoffCrm.Domain.Entities;

public class Server : AuditedEntity
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    /// <summary>
    /// Logical server type. Only "LocalDocker" and "RemoteAgent" are allowed so that the
    /// database never needs to store transport details or API credentials.
    /// </summary>
    public string Type { get; set; } = ServerTypes.LocalDocker;
    /// <summary>
    /// Logical lookup key that maps this record to an entry in appsettings.* files. The
    /// CRM never keeps IP addresses or API keys in the database—only this reference key.
    /// </summary>
    public string ReferenceKey { get; set; } = null!;

    public bool IsActive { get; set; }

    public ICollection<Environment> Environments { get; set; } = new List<Environment>();
}

public static class ServerTypes
{
    public const string LocalDocker = "LocalDocker";
    public const string RemoteAgent = "RemoteAgent";
}
