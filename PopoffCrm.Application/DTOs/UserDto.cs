namespace PopoffCrm.Application.DTOs;

public record UserDto(Guid Id, string Email, string DisplayName, string Role);
