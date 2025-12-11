namespace PopoffCrm.WebApi.Settings;

/// <summary>
/// Google OAuth configuration from the <c>GoogleAuth</c> section.
/// Populated via configuration or <c>GOOGLE_CLIENT_ID</c>, <c>GOOGLE_CLIENT_SECRET</c>, and
/// <c>GOOGLE_ALLOWED_DOMAIN</c> environment variables (see <c>.env.example</c> for placeholders).
/// </summary>
public class GoogleAuthSettings
{
    public const string SectionName = "GoogleAuth";

    /// <summary>
    /// Google OAuth client identifier (<c>GOOGLE_CLIENT_ID</c> in <c>.env.example</c>).
    /// </summary>
    public string ClientId { get; set; } = string.Empty;

    /// <summary>
    /// Google OAuth client secret (<c>GOOGLE_CLIENT_SECRET</c> in <c>.env.example</c>).
    /// </summary>
    public string ClientSecret { get; set; } = string.Empty;

    /// <summary>
    /// Optional domain restriction for sign-ins (<c>GOOGLE_ALLOWED_DOMAIN</c> in <c>.env.example</c>).
    /// </summary>
    public string AllowedDomain { get; set; } = string.Empty;
}
