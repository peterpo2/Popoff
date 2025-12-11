using PopoffCrm.Application.DTOs;

namespace PopoffCrm.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(string email, string password);
    Task<UserDto?> GetUserByIdAsync(Guid userId);
}
