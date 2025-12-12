using PopoffCrm.Application.Common;
using PopoffCrm.Domain.Entities;

namespace PopoffCrm.Application.Interfaces;

public interface IServerConnectionResolver
{
    Task<ServerResolution> ResolveAsync(Server server, CancellationToken cancellationToken = default);
}
