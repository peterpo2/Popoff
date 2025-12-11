using PopoffCrm.Application.Common;
using EnvironmentEntity = PopoffCrm.Domain.Entities.Environment;

namespace PopoffCrm.Application.Interfaces;

public interface IDockerService
{
    Task<string> GetLogs(string projectName, int tail);
    Task<DeploymentResult> DeployEnvironmentAsync(EnvironmentEntity env);
    Task<bool> RestartEnvironmentAsync(EnvironmentEntity env);
}
