using PopoffCrm.Domain.Entities;

namespace PopoffCrm.Infrastructure.Settings;

/// <summary>
/// Remote agents or secondary VPS endpoints live here. API keys stay in configuration
/// files so the CRM database only carries logical references.
/// </summary>
public class ExternalServerConfig
{
    public string Name { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string Type { get; set; } = ServerTypes.RemoteAgent;
}

public class ExternalServerRegistry
{
    public const string SectionName = "ExternalServers";

    public List<ExternalServerConfig> Servers { get; set; } = new();
}
