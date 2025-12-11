using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PopoffCrm.Application.Interfaces;
using PopoffCrm.Infrastructure.Authentication;
using PopoffCrm.Infrastructure.Persistence;
using PopoffCrm.Infrastructure.Services;

namespace PopoffCrm.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));

        var connectionString = configuration.GetConnectionString("Default");

        services.AddDbContext<PopoffCrmDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IDockerService, DockerService>();
        services.AddHostedService<HealthCheckBackgroundService>();

        services.AddHttpClient();

        return services;
    }
}
