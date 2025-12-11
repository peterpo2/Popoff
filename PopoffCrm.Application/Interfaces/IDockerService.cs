using PopoffCrm.Application.Common;
using EnvironmentEntity = PopoffCrm.Domain.Entities.Environment;

namespace PopoffCrm.Application.Interfaces;

public interface IDockerService
{
    Task<string> GetLogs(EnvironmentEntity env, int tail);
    Task<DeploymentResult> DeployEnvironmentAsync(EnvironmentEntity env);
    Task<bool> RestartEnvironmentAsync(EnvironmentEntity env);
}
