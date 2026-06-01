using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using AbanobLeague.Application.Interfaces;

namespace AbanobLeague.API.Controllers
{
    public class HallOfFameController : BaseApiController
    {
        private readonly IHallOfFameService _hallOfFameService;

        public HallOfFameController(IHallOfFameService hallOfFameService)
        {
            _hallOfFameService = hallOfFameService;
        }

        [HttpGet("season/{seasonId}")]
        public async Task<IActionResult> GetHallOfFame(Guid seasonId)
        {
            var result = await _hallOfFameService.GetHallOfFameAsync(seasonId);
            return Ok(result);
        }
    }
}
