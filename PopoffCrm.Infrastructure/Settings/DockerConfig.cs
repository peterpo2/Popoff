namespace PopoffCrm.Infrastructure.Settings;

/// <summary>
/// Docker settings are defined per-host in appsettings.* files. Production keeps the
/// main VPS docker socket while Development disables docker by default.
/// </summary>
public class DockerConfig
{
    public const string SectionName = "Docker";

    public bool Enabled { get; set; }
    public string? SocketPath { get; set; }
}
