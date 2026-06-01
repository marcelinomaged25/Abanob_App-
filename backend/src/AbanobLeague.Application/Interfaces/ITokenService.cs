using System.Security.Claims;
using AbanobLeague.Domain.Entities;

namespace AbanobLeague.Application.Interfaces
{
    public interface ITokenService
    {
        string GenerateAccessToken(AdminUser user);
        string GenerateRefreshToken();
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    }
}
