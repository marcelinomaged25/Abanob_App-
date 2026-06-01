using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AbanobLeague.Application.Interfaces;

namespace AbanobLeague.API.Controllers
{
    public class StandingsController : BaseApiController
    {
        private readonly IRankingService _rankingService;

        public StandingsController(IRankingService rankingService)
        {
            _rankingService = rankingService;
        }

        [HttpGet("season/{seasonId}")]
        public async Task<IActionResult> GetStandings(Guid seasonId)
        {
            var result = await _rankingService.GetStandingsAsync(seasonId);
            return Ok(result);
        }
    }
}
