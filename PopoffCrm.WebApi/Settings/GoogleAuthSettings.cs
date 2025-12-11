namespace PopoffCrm.WebApi.Settings;

/// <summary>
/// Google OAuth configuration from the <c>GoogleAuth</c> section.
/// Environment variables such as <c>GoogleAuth__ClientId</c>, <c>GoogleAuth__ClientSecret</c>,
/// and <c>GoogleAuth__AllowedDomain</c> (add counterparts to <c>.env.example</c> when enabling Google login)
/// can populate these fields.
/// </summary>
public class GoogleAuthSettings
{
    public const string SectionName = "GoogleAuth";

    public string ClientId { get; set; } = string.Empty;

    public string ClientSecret { get; set; } = string.Empty;

    public string AllowedDomain { get; set; } = string.Empty;
}
