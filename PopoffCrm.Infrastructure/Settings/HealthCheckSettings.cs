namespace PopoffCrm.Infrastructure.Settings;

public class HealthCheckSettings
{
    public const string SectionName = "HealthCheck";

    /// <summary>
    /// Interval between health check runs, in seconds.
    /// </summary>
    public int IntervalSeconds { get; set; } = 60;

    /// <summary>
    /// Request timeout per health check, in seconds.
    /// </summary>
    public int TimeoutSeconds { get; set; } = 10;

    /// <summary>
    /// When true, append <see cref="HealthPath"/> to the API URL for health checks.
    /// </summary>
    public bool AppendHealthPath { get; set; } = true;

    /// <summary>
    /// The relative path appended to ApiUrl when <see cref="AppendHealthPath"/> is enabled.
    /// </summary>
    public string HealthPath { get; set; } = "/health";
}
