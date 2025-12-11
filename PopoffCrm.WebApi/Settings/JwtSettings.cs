namespace PopoffCrm.WebApi.Settings;

/// <summary>
/// JWT signing and validation settings loaded from configuration.
/// The values map to the <c>Jwt</c> section, typically provided by environment variables
/// such as <c>JWT__Key</c>, <c>JWT__Issuer</c>, and <c>JWT__Audience</c> (see <c>.env.example</c> where <c>JWT_KEY</c> seeds <c>JWT__Key</c>).
/// </summary>
public class JwtSettings
{
    public const string SectionName = "Jwt";

    public string Key { get; set; } = string.Empty;

    public string Issuer { get; set; } = string.Empty;

    public string Audience { get; set; } = string.Empty;
}
