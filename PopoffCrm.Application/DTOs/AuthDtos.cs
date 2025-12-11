namespace PopoffCrm.Application.DTOs;

public record AuthLoginRequestDto(string Email, string Password);

public record AuthResponseDto(string Token, DateTime ExpiresAt, UserDto User);
