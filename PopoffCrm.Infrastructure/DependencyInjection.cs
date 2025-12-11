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

        // Connection string resolves from Configuration["ConnectionStrings:Default"] so it can be injected via ConnectionStrings__Default env var (see docker-compose/.env.example for SA_PASSWORD).
        var connectionString = configuration["ConnectionStrings:Default"]
            ?? configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("The default connection string must be configured.");

        services.AddDbContext<PopoffCrmDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IDockerService, DockerService>();
        services.AddHostedService<HealthCheckBackgroundService>();

        services.AddHttpClient();

        return services;
    }
}
