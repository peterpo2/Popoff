using System.Diagnostics;
using System.Text;
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
        IOptionsMonitor<HealthCheckSettings> settings)
    {
        _scopeFactory = scopeFactory;
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _settings = settings.CurrentValue;
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
            .Where(e => e.Server != null && e.Server.IsActive)
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

            if (status != HealthStatus.Healthy)
            {
                var severity = status == HealthStatus.Down ? 3 : 1;
                var correlationId = Guid.NewGuid().ToString();

                var detailsBuilder = new StringBuilder();
                detailsBuilder.AppendLine($"Health check status: {status}");
                detailsBuilder.AppendLine($"Url: {url}");
                detailsBuilder.AppendLine($"Response time (ms): {stopwatch.ElapsedMilliseconds}");

                if (response != null)
                {
                    detailsBuilder.AppendLine($"HTTP status: {(int)response.StatusCode} ({response.StatusCode})");
                }

                if (!string.IsNullOrWhiteSpace(message))
                {
                    detailsBuilder.AppendLine($"Message: {message}");
                }

                var errorLog = new ProjectErrorLog
                {
                    Id = Guid.NewGuid(),
                    ProjectId = env.ProjectId,
                    EnvironmentId = env.Id,
                    OccurredOn = DateTime.UtcNow,
                    ErrorType = "HealthCheckFailure",
                    Message = status == HealthStatus.Down
                        ? $"Health check failed for environment {env.Name}"
                        : $"Health check degraded for environment {env.Name}",
                    Details = detailsBuilder.ToString(),
                    Source = "HealthCheckBackgroundService",
                    Severity = severity,
                    CorrelationId = correlationId,
                    RequestData = url,
                    IsResolved = false
                };

                dbContext.ProjectErrorLogs.Add(errorLog);
            }

            response?.Dispose();
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
