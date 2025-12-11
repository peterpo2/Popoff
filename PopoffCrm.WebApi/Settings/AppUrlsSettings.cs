namespace PopoffCrm.WebApi.Settings;

/// <summary>
/// Public URLs and CORS origins configured from the <c>AppUrls</c> section.
/// These values can be supplied via environment variables like <c>AppUrls__PublicBaseUrl</c>
/// and <c>AppUrls__AllowedOrigins</c> (add them to <c>.env</c>/<c>.env.example</c> when needed).
/// </summary>
public class AppUrlsSettings
{
    public const string SectionName = "AppUrls";

    public string PublicBaseUrl { get; set; } = string.Empty;

    public string AllowedOrigins { get; set; } = string.Empty;
}
