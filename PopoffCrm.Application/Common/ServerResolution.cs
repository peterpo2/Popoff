using PopoffCrm.Domain.Entities;

namespace PopoffCrm.Application.Common;

public enum ServerConnectionType
{
    LocalDocker,
    RemoteAgent
}

public record ServerResolution(ServerConnectionType Type, string ReferenceKey, DockerConfigSnapshot? Docker, ExternalServerSnapshot? External)
{
    public static ServerResolution ForLocalDocker(string referenceKey, DockerConfigSnapshot docker)
        => new(ServerConnectionType.LocalDocker, referenceKey, docker, null);

    public static ServerResolution ForRemoteAgent(string referenceKey, ExternalServerSnapshot external)
        => new(ServerConnectionType.RemoteAgent, referenceKey, null, external);
}

public record DockerConfigSnapshot(bool Enabled, string? SocketPath);

public record ExternalServerSnapshot(string Name, string BaseUrl, string ApiKey, string Type);
*** End
