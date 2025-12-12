namespace PopoffCrm.Application.DTOs;

public record ServerDto(
    Guid Id,
    string Name,
    string ReferenceKey,
    string Type,
    bool IsActive,
    string? Description);
