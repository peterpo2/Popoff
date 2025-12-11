using PopoffCrm.Infrastructure.Settings;

namespace PopoffCrm.Infrastructure.Utilities;

public static class HealthCheckUrlBuilder
{
    public static string Build(string apiUrl, HealthCheckSettings settings)
    {
        var baseUrl = apiUrl.TrimEnd('/');

        if (settings.AppendHealthPath && !string.IsNullOrWhiteSpace(settings.HealthPath))
        {
            var path = settings.HealthPath.Trim('/');
            return string.IsNullOrEmpty(path) ? baseUrl : $"{baseUrl}/{path}";
        }

        return baseUrl;
    }
}
