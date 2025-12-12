using System.Linq;
using Microsoft.Extensions.Options;
using PopoffCrm.Application.Common;
using PopoffCrm.Application.Interfaces;
using PopoffCrm.Domain.Entities;
using PopoffCrm.Infrastructure.Settings;

namespace PopoffCrm.Infrastructure.Services;

public class ServerConnectionResolver : IServerConnectionResolver
{
    private readonly IOptionsMonitor<DockerConfig> _dockerOptions;
    private readonly IOptionsMonitor<ExternalServerRegistry> _externalServerOptions;

    public ServerConnectionResolver(
        IOptionsMonitor<DockerConfig> dockerOptions,
        IOptionsMonitor<ExternalServerRegistry> externalServerOptions)
    {
        _dockerOptions = dockerOptions;
        _externalServerOptions = externalServerOptions;
    }

    public Task<ServerResolution> ResolveAsync(Server server, CancellationToken cancellationToken = default)
    {
        if (server == null)
        {
            throw new ArgumentNullException(nameof(server));
        }

        return Task.FromResult(server.Type switch
        {
            ServerTypes.LocalDocker => ResolveLocalDocker(server),
            ServerTypes.RemoteAgent => ResolveRemoteAgent(server),
            _ => throw new InvalidOperationException($"Unknown server type '{server.Type}'.")
        });
    }

    private ServerResolution ResolveLocalDocker(Server server)
    {
        var docker = _dockerOptions.CurrentValue;
        return ServerResolution.ForLocalDocker(server.ReferenceKey, new DockerConfigSnapshot(docker.Enabled, docker.SocketPath));
    }

    private ServerResolution ResolveRemoteAgent(Server server)
    {
        var match = _externalServerOptions.CurrentValue.Servers
            .FirstOrDefault(s => string.Equals(s.Name, server.ReferenceKey, StringComparison.OrdinalIgnoreCase));

        if (match == null)
        {
            throw new InvalidOperationException($"External server '{server.ReferenceKey}' is not defined in configuration.");
        }

        return ServerResolution.ForRemoteAgent(server.ReferenceKey, new ExternalServerSnapshot(match.Name, match.BaseUrl, match.ApiKey, match.Type));
    }
}
