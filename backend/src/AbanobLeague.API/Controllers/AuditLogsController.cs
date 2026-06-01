using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AbanobLeague.Application.Interfaces;

namespace AbanobLeague.API.Controllers
{
    [Authorize]
    public class AuditLogsController : BaseApiController
    {
        private readonly IAuditService _auditService;

        public AuditLogsController(IAuditService auditService)
        {
            _auditService = auditService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAuditLogs()
        {
            var result = await _auditService.GetAuditLogsAsync();
            return Ok(result);
        }
    }
}
