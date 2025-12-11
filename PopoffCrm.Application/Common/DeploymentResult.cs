namespace PopoffCrm.Application.Common;

public record DeploymentResult(bool Success, string Message, string? Logs = null);
