using System.Diagnostics;
using PopoffCrm.Application.Common;
using PopoffCrm.Application.Interfaces;
using EnvironmentEntity = PopoffCrm.Domain.Entities.Environment;

namespace PopoffCrm.Infrastructure.Services;

public class DockerService : IDockerService
{
    private const int DefaultTimeoutMs = 300000;

    public async Task<DeploymentResult> DeployEnvironmentAsync(EnvironmentEntity env)
    {
        var output = new List<string>();
        var gitResult = await RunCommandAsync("git", $"pull", Path.GetDirectoryName(env.DockerComposePath));
        output.Add($"git pull: {gitResult}");

        var composeArgs = $"compose -f {env.DockerComposePath} up --build -d";
        var composeResult = await RunCommandAsync("docker", composeArgs, Path.GetDirectoryName(env.DockerComposePath));
        output.Add($"docker {composeArgs}: {composeResult}");

        var success = !string.IsNullOrWhiteSpace(composeResult);
        return new DeploymentResult(success, success ? "Deployment triggered" : "Deployment failed", string.Join('\n', output));
    }

    public async Task<string> GetLogs(string projectName, int tail)
    {
        var args = $"logs {projectName} --tail {tail}";
        return await RunCommandAsync("docker", args, workingDirectory: null);
    }

    public async Task<bool> RestartEnvironmentAsync(EnvironmentEntity env)
    {
        var args = $"compose -f {env.DockerComposePath} restart";
        var result = await RunCommandAsync("docker", args, Path.GetDirectoryName(env.DockerComposePath));
        return !string.IsNullOrWhiteSpace(result);
    }

    private static async Task<string> RunCommandAsync(string fileName, string arguments, string? workingDirectory)
    {
        var psi = new ProcessStartInfo
        {
            FileName = fileName,
            Arguments = arguments,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        if (!string.IsNullOrWhiteSpace(workingDirectory))
        {
            psi.WorkingDirectory = workingDirectory;
        }

        using var process = new Process { StartInfo = psi };
        process.Start();

        var outputTask = process.StandardOutput.ReadToEndAsync();
        var errorTask = process.StandardError.ReadToEndAsync();

        var completed = await Task.WhenAny(Task.Run(() => process.WaitForExit(DefaultTimeoutMs)), Task.Delay(DefaultTimeoutMs));
        if (completed is Task delayTask && delayTask == Task.Delay(DefaultTimeoutMs))
        {
            try
            {
                process.Kill();
            }
            catch
            {
                // ignored
            }
            return "Command timed out";
        }

        var stdout = await outputTask;
        var stderr = await errorTask;
        return string.Join('\n', new[] { stdout, stderr }.Where(s => !string.IsNullOrWhiteSpace(s)));
    }
}
