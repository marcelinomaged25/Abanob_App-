using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AbanobLeague.Application.Interfaces;

namespace AbanobLeague.API.Controllers
{
    public class AnalyticsController : BaseApiController
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        [HttpGet("season/{seasonId}")]
        public async Task<IActionResult> GetAnalytics(Guid seasonId)
        {
            var result = await _analyticsService.GetAnalyticsAsync(seasonId);
            return Ok(result);
        }
    }
}
