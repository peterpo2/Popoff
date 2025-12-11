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

        services.AddDbContext<PopoffCrmDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IDockerService, DockerService>();
        services.AddHostedService<HealthCheckBackgroundService>();

        services.AddHttpClient();

        return services;
    }
}
