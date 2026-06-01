using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace AbanobLeague.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseApiController : ControllerBase
    {
        protected Guid UserId
        {
            get
            {
                var val = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                return Guid.TryParse(val, out var guid) ? guid : Guid.Empty;
            }
        }
    }
}
