using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AbanobLeague.Application.DTOs.Auth;
using AbanobLeague.Application.Interfaces;

namespace AbanobLeague.API.Controllers
{
    public class AuthController : BaseApiController
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var result = await _authService.LoginAsync(dto);
            if (result == null)
            {
                return Unauthorized(new { message = "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
            }
            return Ok(result);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto dto)
        {
            var result = await _authService.RefreshTokenAsync(dto);
            if (result == null)
            {
                return BadRequest(new { message = "رمز التحديث غير صالح أو منتهي الصلاحية" });
            }
            return Ok(result);
        }
    }
}
