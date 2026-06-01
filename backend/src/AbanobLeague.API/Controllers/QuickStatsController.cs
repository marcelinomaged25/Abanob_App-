using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AbanobLeague.Application.Interfaces;

namespace AbanobLeague.API.Controllers
{
    public class QuickStatsController : BaseApiController
    {
        private readonly IQuickStatsService _statsService;

        public QuickStatsController(IQuickStatsService statsService)
        {
            _statsService = statsService;
        }

        [HttpGet("season/{seasonId}")]
        public async Task<IActionResult> GetQuickStats(Guid seasonId)
        {
            var result = await _statsService.GetQuickStatsAsync(seasonId);
            return Ok(result);
        }
    }
}
