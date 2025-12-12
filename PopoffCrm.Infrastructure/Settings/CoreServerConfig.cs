namespace PopoffCrm.Infrastructure.Settings;

/// <summary>
/// Describes a server in production or staging infrastructure. The IP/hostname stays
/// in appsettings.Production.json so sensitive details never enter the CRM database.
/// </summary>
public class CoreServerConfig
{
    public const string SectionName = "CoreServers";

    public string Name { get; set; } = string.Empty;
    public string Ip { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
}
