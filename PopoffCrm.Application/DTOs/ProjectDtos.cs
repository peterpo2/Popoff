namespace PopoffCrm.Application.DTOs;

public record ProjectDto(Guid Id, string Name, string Code, string? Description, string? RepositoryUrl);
