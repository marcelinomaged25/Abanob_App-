using System.Threading.Tasks;
using AbanobLeague.Application.DTOs.Auth;

namespace AbanobLeague.Application.Interfaces
{
    public interface IAuthService
    {
        Task<TokenDto?> LoginAsync(LoginDto dto);
        Task<TokenDto?> RefreshTokenAsync(RefreshTokenRequestDto dto);
    }
}
