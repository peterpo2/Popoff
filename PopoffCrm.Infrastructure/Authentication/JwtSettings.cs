namespace PopoffCrm.Infrastructure.Authentication;

public class JwtSettings
{
    public const string SectionName = "Jwt";
    public string Issuer { get; set; } = null!;
    public string Audience { get; set; } = null!;
    public string Key { get; set; } = string.Empty;
    public string SigningKey
    {
        get => Key;
        set => Key = value;
    }
    public int ExpiryMinutes { get; set; } = 60;
}
