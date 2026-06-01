using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AbanobLeague.Application.Interfaces;

namespace AbanobLeague.API.Controllers
{
    public class LeaderboardController : BaseApiController
    {
        private readonly IRankingService _rankingService;

        public LeaderboardController(IRankingService rankingService)
        {
            _rankingService = rankingService;
        }

        [HttpGet("season/{seasonId}")]
        public async Task<IActionResult> GetLiveLeaderboard(Guid seasonId)
        {
            var result = await _rankingService.GetLiveLeaderboardAsync(seasonId);
            return Ok(result);
        }
    }
}
