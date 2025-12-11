namespace PopoffCrm.Application.DTOs;

public record ServerDto(
    Guid Id,
    string Name,
    string IpAddress,
    string? HostName,
    bool IsActive,
    string ConnectionType,
    string? ConnectionData,
    string? Description);
