using System.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PopoffCrm.Domain.Entities;
using PopoffCrm.Infrastructure.Persistence;
using PopoffCrm.Infrastructure.Settings;
using PopoffCrm.Infrastructure.Utilities;

namespace PopoffCrm.Infrastructure.Services;

public class HealthCheckBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<HealthCheckBackgroundService> _logger;
    private readonly HealthCheckSettings _settings;
    private readonly TimeSpan _interval;

    public HealthCheckBackgroundService(
        IServiceScopeFactory scopeFactory,
        IHttpClientFactory httpClientFactory,
        ILogger<HealthCheckBackgroundService> logger,
        IOptionsSnapshot<HealthCheckSettings> settings)
    {
        _scopeFactory = scopeFactory;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _settings = settings.Value;
        _interval = TimeSpan.FromSeconds(Math.Max(1, _settings.IntervalSeconds));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var timer = new PeriodicTimer(_interval);
        do
        {
            try
            {
                await RunHealthChecks(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Health check cycle failed");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    private async Task RunHealthChecks(CancellationToken cancellationToken)
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<PopoffCrmDbContext>();
        var environments = await dbContext.Environments
            .AsNoTracking()
            .Include(e => e.Server)
            .Where(e => e.Server.IsActive)
            .ToListAsync(cancellationToken);

        foreach (var env in environments)
        {
            if (string.IsNullOrWhiteSpace(env.ApiUrl))
            {
                continue;
            }

            var url = HealthCheckUrlBuilder.Build(env.ApiUrl!, _settings);
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(Math.Max(1, _settings.TimeoutSeconds));

            var stopwatch = Stopwatch.StartNew();
            HttpResponseMessage? response = null;
            HealthStatus status;
            string? message = null;

            try
            {
                response = await client.GetAsync(url, cancellationToken);
                stopwatch.Stop();
                status = response.IsSuccessStatusCode ? HealthStatus.Healthy : HealthStatus.Degraded;
            }
            catch (TaskCanceledException)
            {
                stopwatch.Stop();
                status = HealthStatus.Down;
                message = "Request timed out";
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                status = HealthStatus.Down;
                message = ex.Message;
            }

            var result = new HealthCheckResult
            {
                Id = Guid.NewGuid(),
                EnvironmentId = env.Id,
                Status = status,
                CheckedOn = DateTime.UtcNow,
                ResponseTimeMs = (int)stopwatch.ElapsedMilliseconds,
                StatusCode = (int?)response?.StatusCode,
                Message = message
            };

            dbContext.HealthCheckResults.Add(result);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
