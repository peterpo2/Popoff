using System.Diagnostics;
using System.IO;
using PopoffCrm.Application.Common;
using PopoffCrm.Application.Interfaces;
using EnvironmentEntity = PopoffCrm.Domain.Entities.Environment;

namespace PopoffCrm.Infrastructure.Services;

public class DockerService : IDockerService
{
    private const int DefaultTimeoutMs = 300000;

    public async Task<DeploymentResult> DeployEnvironmentAsync(EnvironmentEntity env)
    {
        if (string.IsNullOrWhiteSpace(env.DockerComposePath))
        {
            return new DeploymentResult(false, "Docker compose path is not configured for this environment.");
        }

        var projectName = env.DockerProjectName ?? env.Slug;
        if (string.IsNullOrWhiteSpace(projectName))
        {
            return new DeploymentResult(false, "Docker project name is not configured for this environment.");
        }

        var workingDirectory = GetWorkingDirectory(env.DockerComposePath);
        var output = new List<string>();
        if (!string.IsNullOrWhiteSpace(workingDirectory))
        {
            var gitResult = await RunCommandAsync("git", "pull", workingDirectory);
            output.Add($"git pull: {gitResult}");
        }

        var composeArgs = $"compose -p {projectName} -f {env.DockerComposePath} up --build -d";
        var composeResult = await RunCommandAsync("docker", composeArgs, workingDirectory);
        output.Add($"docker {composeArgs}: {composeResult}");

        var success = !string.IsNullOrWhiteSpace(composeResult);
        return new DeploymentResult(success, success ? "Deployment triggered" : "Deployment failed", string.Join('\n', output));
    }

    public async Task<string> GetLogs(EnvironmentEntity env, int tail)
    {
        var containerName = env.DockerProjectName ?? env.Slug;
        if (string.IsNullOrWhiteSpace(containerName))
        {
            return "Container name not configured";
        }

        var args = $"logs {containerName} --tail {tail}";
        var workingDirectory = GetWorkingDirectory(env.DockerComposePath);
        return await RunCommandAsync("docker", args, workingDirectory);
    }

    public async Task<bool> RestartEnvironmentAsync(EnvironmentEntity env)
    {
        if (string.IsNullOrWhiteSpace(env.DockerComposePath))
        {
            return false;
        }

        var projectName = env.DockerProjectName ?? env.Slug;
        var args = string.IsNullOrWhiteSpace(projectName)
            ? $"compose -f {env.DockerComposePath} restart"
            : $"compose -p {projectName} -f {env.DockerComposePath} restart";
        var result = await RunCommandAsync("docker", args, GetWorkingDirectory(env.DockerComposePath));
        return !string.IsNullOrWhiteSpace(result);
    }

    private static string? GetWorkingDirectory(string? dockerComposePath)
    {
        if (string.IsNullOrWhiteSpace(dockerComposePath))
        {
            return null;
        }

        var directory = Path.GetDirectoryName(dockerComposePath);
        return string.IsNullOrWhiteSpace(directory) ? null : directory;
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
        try
        {
            process.Start();
        }
        catch (Exception ex)
        {
            return $"Failed to start '{fileName} {arguments}': {ex.Message}";
        }

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
        var combined = string.Join('\n', new[] { stdout, stderr }.Where(s => !string.IsNullOrWhiteSpace(s)));

        if (string.IsNullOrWhiteSpace(combined))
        {
            return process.ExitCode == 0
                ? "Command finished without output"
                : $"Command exited with code {process.ExitCode} without output";
        }

        return combined;
    }
}
